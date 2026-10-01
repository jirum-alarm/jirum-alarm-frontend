/**
 * 탭바 표시 — "탭 루트에서만 보인다"를 **구조로** 보장하는지.
 *
 * web `isTabRootPath` 는 탭 루트(`/`·`/trending/*`·`/community`·`/alarm`·`/mypage`)에서만 하단바를
 * 그린다. 앱은 예전엔 하위 화면을 탭 안 스택에 쌓고 라우트 이름으로 탭바를 숨겼다 되살렸는데,
 * 되살리는 타이밍(전환 시작·끝·스와이프 취소)이 늘 어긋나 "상세에서 나오면 바텀바가 뒤늦게 생긴다·
 * 깜빡인다"(2026-10-01 사용자)가 반복됐다. 지금은 하위 화면이 전부 탭 **바깥** 루트 스택에 있어
 * 탭바째 덮는다 — 숨기고 되살리는 로직이 없으니 왕복 시나리오별 상태 검증도 필요 없다.
 * 남는 계약은 "어느 화면이 어느 스택에 있나" 하나다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const tabStack = read('src/navigations/tab/TabStackNavigator.tsx');
const rootStack = read('src/navigations/stack/MainNavigator.tsx');
const constants = read('src/shared/constant/navigations.ts');

/** 탭 루트 위에 쌓이는 화면 전부. 하나라도 탭 스택에 남으면 그 화면에서만 탭바가 남는다. */
const STACKED = [
  'DETAIL',
  'COMMENTS',
  'SEARCH',
  'CURATION',
  'TOSS_CURATION',
  'WEBVIEW',
  'MYPAGE_ACCOUNT',
  'MYPAGE_NICKNAME',
  'MYPAGE_PASSWORD',
  'MYPAGE_PERSONAL',
  'MYPAGE_CATEGORIES',
  'MYPAGE_KEYWORD',
  'MYPAGE_NOTIFICATION',
  'MYPAGE_TERMS',
  'POLICY',
  'LIKE',
  'THEMES',
  'THEME_DETAIL',
  'COMMUNITY_POST',
  'COMMUNITY_WRITE',
];

describe('탭바는 탭 루트에서만 보인다 — 하위 화면은 루트 스택이 덮는다', () => {
  it.each(STACKED)('%s 는 루트 스택에 있고 탭 스택엔 없다', name => {
    expect(rootStack).toContain(`name={tabStackNavigations.${name}}`);
    expect(tabStack).not.toContain(`tabStackNavigations.${name}`);
  });

  it('탭 스택엔 탭 루트(ROOT) 하나뿐이다', () => {
    const screens = [
      ...tabStack.matchAll(/name=\{tabStackNavigations\.(\w+)\}/g),
    ].map(m => m[1]);
    expect(screens).toEqual(['ROOT']);
  });

  it('상수에 있는 하위 화면은 빠짐없이 위 목록에 있다 — 새 화면이 탭 스택으로 새지 않게', () => {
    const block = constants.slice(
      constants.indexOf('const tabStackNavigations'),
      constants.indexOf(
        '} as const',
        constants.indexOf('const tabStackNavigations'),
      ),
    );
    const declared = [...block.matchAll(/^\s+([A-Z_]+):/gm)]
      .map(m => m[1])
      .filter(name => name !== 'ROOT');
    expect(new Set(declared)).toEqual(new Set(STACKED));
  });
});

export {};
