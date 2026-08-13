import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

// TabScrollTopButton.tsx 는 'use client' 라 bare node --test 로 import 할 수 없다.
// 판정 로직은 tab-scroll-top.ts 와 같은 규칙을 여기서 재현한다.
const SCROLL_TOP_TAB_PATHS = [
  '/',
  '/trending/ranking',
  '/trending/live',
  '/community',
  '/alarm',
] as const;

function isScrollTopTabPath(pathName: string) {
  const path = pathName.length > 1 ? pathName.replace(/\/+$/, '') : pathName;
  return (SCROLL_TOP_TAB_PATHS as readonly string[]).includes(path);
}

const SOURCE = readFileSync(new URL('./TabScrollTopButton.tsx', import.meta.url), 'utf8');
const HELPER = readFileSync(new URL('./tab-scroll-top.ts', import.meta.url), 'utf8');
const BOTTOM_NAV = readFileSync(new URL('./layout/BottomNav.tsx', import.meta.url), 'utf8');

describe('isScrollTopTabPath', () => {
  it('홈·발견·커뮤니티·알림 루트에서만 켠다', () => {
    assert.equal(isScrollTopTabPath('/'), true);
    assert.equal(isScrollTopTabPath('/trending/ranking'), true);
    assert.equal(isScrollTopTabPath('/trending/live'), true);
    assert.equal(isScrollTopTabPath('/community'), true);
    assert.equal(isScrollTopTabPath('/alarm'), true);
  });

  it('내정보·하위 페이지는 끈다', () => {
    assert.equal(isScrollTopTabPath('/mypage'), false);
    assert.equal(isScrollTopTabPath('/community/77'), false);
    assert.equal(isScrollTopTabPath('/community/write'), false);
    assert.equal(isScrollTopTabPath('/alarm/settings'), false);
    assert.equal(isScrollTopTabPath('/trending'), false);
  });

  it('트레일링 슬래시도 루트로 본다', () => {
    assert.equal(isScrollTopTabPath('/community/'), true);
    assert.equal(isScrollTopTabPath('/alarm/'), true);
  });
});

describe('소스 계약', () => {
  it('헬퍼와 같은 경로 목록을 쓴다', () => {
    assert.match(HELPER, /\/trending\/ranking/);
    assert.match(HELPER, /\/community/);
    assert.match(HELPER, /\/alarm/);
    assert.match(SOURCE, /from '\.\/tab-scroll-top'/);
  });

  it('탭바 높이 변수 위에 붙는다', () => {
    assert.match(SOURCE, /--bottom-nav-padding/);
  });

  it('커뮤니티 글쓰기 FAB 과 겹치지 않게 올린다', () => {
    assert.match(SOURCE, /FAB_CLEARANCE/);
    assert.match(SOURCE, /hasWriteFab/);
    assert.match(SOURCE, /--bottom-fab-padding/);
  });

  it('앱에선 웹 네비 대신 이 버튼을 붙인다', () => {
    assert.match(BOTTOM_NAV, /if \(isJirumAlarmApp\) return <TabScrollTopButton/);
    assert.doesNotMatch(BOTTOM_NAV, /if \(isJirumAlarmApp\) return null;/);
  });
});
