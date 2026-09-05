import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

// BottomNav.tsx 는 'use client' + jsx + next/navigation 이라 bare node --test 로
// import 할 수 없다(apps/web 테스트 러너 제약). 판정 로직을 소스에서 뽑아 재현하고,
// 소스 텍스트로 계약을 고정한다.
const SOURCE = readFileSync(new URL('./BottomNav.tsx', import.meta.url), 'utf8');

// 탭 루트 목록은 shared/config/tab-root 로 옮겼다 — root layout(서버)도 같은
// 판정을 해야 하는데 BottomNav 는 'use client' 라 서버에서 못 읽기 때문.
const TAB_ROOT_SOURCE = readFileSync(new URL('../../config/tab-root.ts', import.meta.url), 'utf8');

// 앱(apps/mobile/.../tab-routing.ts isTabRootUrl)의 tabRootPaths 와 짝을 이루는 목록.
const TAB_ROOT_PATHS = [
  '/',
  '/trending/ranking',
  '/trending/live',
  '/community',
  '/alarm',
  '/mypage',
];

function isTabRootPath(pathName: string) {
  const path = pathName.length > 1 ? pathName.replace(/\/+$/, '') : pathName;
  return TAB_ROOT_PATHS.includes(path);
}

describe('바텀네비 표시 경로 (앱 탭바와 동일 규칙)', () => {
  it('탭 루트에서는 보인다', () => {
    for (const path of TAB_ROOT_PATHS) {
      assert.equal(isTabRootPath(path), true, `${path} 는 탭 루트`);
    }
  });

  it('하위 페이지에서는 숨긴다 — 앱과 갈렸던 지점', () => {
    // 이 경로들이 회귀의 핵심. startsWith 로 판정하면 전부 true 가 되어 네비가 남는다.
    for (const path of [
      '/mypage/account',
      '/mypage/account/nickname',
      '/mypage/keyword',
      '/mypage/categories',
      '/mypage/terms-policies',
      '/community/77',
      '/community/write',
      '/alarm/settings',
      '/trending',
    ]) {
      assert.equal(isTabRootPath(path), false, `${path} 는 탭 루트가 아니다`);
    }
  });

  it('원래도 숨겨졌던 경로는 그대로 숨김', () => {
    for (const path of ['/like', '/products/123', '/search', '/deals', '/login', '/signup']) {
      assert.equal(isTabRootPath(path), false);
    }
  });

  it('트레일링 슬래시도 루트로 본다', () => {
    assert.equal(isTabRootPath('/mypage/'), true);
    assert.equal(isTabRootPath('/community/'), true);
    assert.equal(isTabRootPath('/'), true, "'/' 는 빈 문자열로 죽지 않는다");
  });

  it('접두사 오탐이 없다', () => {
    assert.equal(isTabRootPath('/mypagex'), false);
    assert.equal(isTabRootPath('/communityx'), false);
  });
});

describe('소스 계약', () => {
  it('렌더 게이트가 isTabRootPath 를 쓴다 (isActive startsWith 로 회귀 금지)', () => {
    assert.match(
      SOURCE,
      /if \(!isTabRootPath\(pathName\)\) return null;/,
      'BottomNav 의 렌더 게이트가 isTabRootPath 가 아니다 — 하위 경로에 네비가 되살아난다',
    );
  });

  it('앱(웹뷰)에서는 웹 네비를 그리지 않는다 — 네이티브 탭바와 두 겹 방지', () => {
    assert.match(
      SOURCE,
      /if \(isJirumAlarmApp\) return <TabScrollTopButton/,
      '앱 게이트가 없다 — 앱에서 네이티브 탭바 위에 웹 네비가 겹친다',
    );
    assert.doesNotMatch(SOURCE, /if \(isJirumAlarmApp\) return null;/);
    // isHydrated 를 AND 로 걸면 하이드레이션 전에 네비가 떴다 사라진다.
    assert.doesNotMatch(SOURCE, /if \(isHydrated && isJirumAlarmApp\) return <TabScrollTopButton/);
  });

  it('아래로 스크롤하면 숨는다 — isBottomNavVisible 하드코딩 금지', () => {
    // 2026-03-27 커뮤니티 수정 커밋에서 `const isBottomNavVisible = true;` 로 굳어
    // 스크롤 숨김이 조용히 죽었다. 훅 호출은 남아 있어 grep 으로는 살아 보였다.
    assert.doesNotMatch(SOURCE, /isBottomNavVisible = true;/);
    assert.match(SOURCE, /const isBottomNavVisible = useHeaderVisibility\(\);/);
  });

  it('홈도 예외 없이 같은 규칙을 쓴다', () => {
    // 홈 예외는 24ac472c 에서 transform 충돌 버그 우회로 들어갔던 잔재다.
    // 원인이 고쳐졌으므로 홈만 다르게 두지 않는다.
    assert.doesNotMatch(SOURCE, /pathName === PAGE\.HOME \? true/);
  });

  it('TAB_ROOT_PATHS 가 앱과 같은 6개 경로를 담는다', () => {
    const block = TAB_ROOT_SOURCE.match(/TAB_ROOT_PATHS[^=]*=\s*\[([\s\S]*?)\]/)?.[1] ?? '';
    for (const token of [
      'PAGE.HOME',
      'PAGE.TRENDING_RANKING',
      'PAGE.TRENDING_LIVE',
      'PAGE.COMMUNITY',
      'PAGE.ALARM',
      'PAGE.MYPAGE',
    ]) {
      assert.ok(block.includes(token), `${token} 누락`);
    }
  });

  it('BottomNav 와 root layout 이 같은 목록을 쓴다 — 두 벌로 갈리면 여백과 렌더가 어긋난다', () => {
    // BottomNav 는 렌더를, root layout 은 하단 여백(data-bottom-nav)을 같은
    // 판정으로 정한다. 한쪽이 자기 목록을 다시 정의하면 여백만 남거나 그 반대가 된다.
    assert.match(SOURCE, /from '@\/shared\/config\/tab-root'/);
    assert.doesNotMatch(SOURCE, /const TAB_ROOT_PATHS/);

    const LAYOUT = readFileSync(new URL('../../../app/layout.tsx', import.meta.url), 'utf8');
    assert.match(LAYOUT, /isTabRootPath/);
    assert.match(LAYOUT, /data-bottom-nav/);
  });
});
