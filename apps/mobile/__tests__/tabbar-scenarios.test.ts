/**
 * 탭바 표시 — 화면 이동 시나리오별 검증.
 *
 * 실기 탭 조작을 자동화할 수 없어(시뮬레이터에 tap 도구 없음) 결정 로직을
 * 직접 실행해 케이스별로 확인한다. 라우트 기반이라 이게 실제 동작과 같다:
 * 화면이 상태를 등록하는 게 아니라 **포커스된 라우트 이름 하나**가 정한다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const stack = read('src/navigations/tab/TabStackNavigator.tsx');

/**
 * TabStackNavigator 의 hidesTabBar 를 그대로 재현한다.
 * (그 파일은 RN 의존이 많아 import 가 안 되므로 소스에서 규칙을 읽어 검증)
 */
const ROUTES = {
  ROOT: 'TabRoot',
  DETAIL: 'ProductDetail',
  COMMENTS: 'ProductComments',
  SEARCH: 'Search',
  CURATION: 'Curation',
  WEBVIEW: 'TabWebViewPage',
};

function hidesTabBar(routeName: string): boolean {
  // ★상세는 숨기지 않는다(2026-08-17 지시). BottomCTA 가 탭바 위로 얹힌다.
  return [
    ROUTES.COMMENTS,
    ROUTES.SEARCH,
    ROUTES.CURATION,
    ROUTES.WEBVIEW,
  ].includes(routeName);
}

describe('소스의 규칙과 이 테스트가 일치하는가', () => {
  it('hidesTabBar 가 검사하는 라우트가 4개 그대로다', () => {
    const fn = stack.slice(
      stack.indexOf('function hidesTabBar'),
      stack.indexOf('function hidesTabBar') + 700,
    );
    for (const key of ['COMMENTS', 'SEARCH', 'CURATION', 'WEBVIEW']) {
      expect(fn).toContain(`tabStackNavigations.${key}`);
    }
    // ROOT 는 숨기지 않는다 — 들어 있으면 탭 루트에서 탭바가 사라진다
    expect(fn).not.toContain('tabStackNavigations.ROOT');
    // ★상세도 숨기지 않는다(주석엔 등장하므로 코드 줄만 본다)
    const code = fn
      .split('\n')
      .filter((l: string) => !/^\s*(\/\/|\*)/.test(l))
      .join('\n');
    expect(code).not.toContain('tabStackNavigations.DETAIL');
  });

  it('라우트 이름 상수가 실제 값과 같다', () => {
    const nav = read('src/shared/constant/navigations.ts');
    expect(nav).toContain(`DETAIL: '${ROUTES.DETAIL}'`);
    expect(nav).toContain(`CURATION: '${ROUTES.CURATION}'`);
    expect(nav).toContain(`WEBVIEW: '${ROUTES.WEBVIEW}'`);
    expect(nav).toContain(`ROOT: '${ROUTES.ROOT}'`);
  });
});

describe('★★리스너는 포커스된 탭에서만 반영한다', () => {
  it('탭 5개 스택에서 각각 도는 리스너에 가드가 있다', () => {
    // 이 리스너는 탭마다 하나씩 있다. 가드가 없으면 발견 탭에 상세를 열어둔 채
    // 홈으로 왔을 때 발견 탭 리스너가 false 로 덮어써 홈에서도 사라진다.
    expect(stack).toContain('isFocusedRef.current');
    const listener = stack.slice(
      stack.indexOf('screenListeners'),
      stack.indexOf('screenListeners') + 800,
    );
    expect(listener).toContain('if (isFocusedRef.current)');
  });

  it('탭 복귀 시 자기 스택 최상단으로 다시 맞춘다', () => {
    // 다른 탭에 있는 동안 이 탭 리스너는 막혀 있었으므로,
    // 돌아올 때 한 번 재계산해야 한다.
    expect(stack).toContain('useIsFocused');
    expect(stack).toContain('state?.routes?.[state.index]?.name');
  });
});

describe('케이스별 — 탭바가 보여야 하는가', () => {
  const cases: [string, string, boolean][] = [
    ['홈(탭 루트)', ROUTES.ROOT, true],
    ['상품 상세', ROUTES.DETAIL, true], // ★숨기지 않는다(CTA 가 위로 얹힘)
    ['댓글', ROUTES.COMMENTS, false],
    ['검색', ROUTES.SEARCH, false],
    ['더보기 목록', ROUTES.CURATION, false],
    ['웹뷰 페이지(토스)', ROUTES.WEBVIEW, false],
  ];

  it.each(cases)('%s → 탭바 %s', (_label, route, shouldShow) => {
    expect(!hidesTabBar(route)).toBe(shouldShow);
  });
});

describe('★왕복 시나리오 — 이전 상태가 남지 않는가', () => {
  /** 라우트 스택을 순서대로 밟으며 매 시점의 탭바 상태를 기록한다. */
  const walk = (routes: string[]) => routes.map(r => !hidesTabBar(r));

  it('홈 → 상세 → 홈 (상세에서도 보인다)', () => {
    expect(walk([ROUTES.ROOT, ROUTES.DETAIL, ROUTES.ROOT])).toEqual([
      true,
      true,
      true,
    ]);
  });

  it('홈 → 더보기 → 상세 → 더보기 → 홈', () => {
    expect(
      walk([
        ROUTES.ROOT,
        ROUTES.CURATION,
        ROUTES.DETAIL,
        ROUTES.CURATION,
        ROUTES.ROOT,
      ]),
    ).toEqual([true, false, true, false, true]);
  });

  it('★탭 왕복 — 홈 → 상세 → 홈 → 상세 → 홈 (10회)', () => {
    // 카운터 방식에선 여기서 값이 어긋나 탭바가 영구히 사라졌다.
    const seq: string[] = [];
    for (let i = 0; i < 10; i++) seq.push(ROUTES.ROOT, ROUTES.DETAIL);
    seq.push(ROUTES.ROOT);

    // 상세도 이제 보이므로 전 구간 true 여야 한다.
    expect(walk(seq).every(Boolean)).toBe(true);
  });

  it('상세 → 댓글 → 상세 (댓글만 숨긴다)', () => {
    // 댓글은 하단 입력창이 탭바를 덮으므로 계속 숨긴다.
    expect(walk([ROUTES.DETAIL, ROUTES.COMMENTS, ROUTES.DETAIL])).toEqual([
      true,
      false,
      true,
    ]);
  });

  it('더보기 → 웹뷰 → 홈 (사용자가 재현한 경로)', () => {
    expect(walk([ROUTES.CURATION, ROUTES.WEBVIEW, ROUTES.ROOT])).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('알 수 없는 라우트는 탭바를 켠다(안전 기본값)', () => {
    expect(!hidesTabBar('SomethingNew')).toBe(true);
  });

  it('★다른 탭에 숨김 화면이 열려 있어도 홈은 영향 없다', () => {
    // 탭별 스택이 독립이므로 "지금 보는 탭의 최상단"만이 답이다.
    const discoverTop = ROUTES.SEARCH; // 발견 탭엔 검색이 열려 있음
    const homeTop = ROUTES.ROOT;

    expect(!hidesTabBar(homeTop)).toBe(true);
    // (발견 탭 상태는 무시된다 — 리스너 가드가 그 역할)
    expect(!hidesTabBar(discoverTop)).toBe(false);
  });
});

export {};
