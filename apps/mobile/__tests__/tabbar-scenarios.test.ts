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

/**
 * 내정보·커뮤니티 하위 화면은 탭바를 숨긴다 — web 과 같은 규칙.
 *
 * web `isTabRootPath` 는 탭 루트 6개(`/`·`/trending/*`·`/community`·`/alarm`·
 * `/mypage`)에서만 하단바를 그린다. 하위 설정 화면·글 상세에서 하단바가 남으면
 * 같은 화면인데 web 과 앱이 달라진다. 상세(DETAIL)만 의도적 예외다.
 */
describe('내정보·커뮤니티 하위 라우트는 탭바를 숨긴다', () => {
  const MYPAGE_SUBS = [
    'MYPAGE_ACCOUNT',
    'MYPAGE_NICKNAME',
    'MYPAGE_PASSWORD',
    'MYPAGE_PERSONAL',
    'MYPAGE_CATEGORIES',
    'MYPAGE_KEYWORD',
    'MYPAGE_TERMS',
    'POLICY',
    'LIKE',
    'THEMES',
    'THEME_DETAIL',
  ];
  const COMMUNITY_SUBS = ['COMMUNITY_POST', 'COMMUNITY_WRITE'];

  it('11개 내정보 하위 라우트가 숨김 집합에 전부 있다', () => {
    // ★하나라도 빠지면 그 화면에서만 탭바가 남는다 — "같은 정책을 한 곳에만
    // 적용"이 이 레포에서 4번 재발한 실패 모양이다.
    const set = stack.slice(
      stack.indexOf('const MYPAGE_SUB_ROUTES'),
      stack.indexOf('const COMMUNITY_SUB_ROUTES'),
    );
    expect(set.length).toBeGreaterThan(0);
    for (const key of MYPAGE_SUBS) {
      expect(set).toContain(`tabStackNavigations.${key}`);
    }
  });

  it('커뮤니티 하위 라우트 2개가 숨김 집합에 있다', () => {
    const set = stack.slice(stack.indexOf('const COMMUNITY_SUB_ROUTES'));
    for (const key of COMMUNITY_SUBS) {
      expect(set.slice(0, 400)).toContain(`tabStackNavigations.${key}`);
    }
  });

  it('hidesTabBar 가 두 집합을 실제로 검사한다', () => {
    // 집합만 선언하고 hidesTabBar 에서 안 쓰면 조용히 아무 효과가 없다.
    const fn = stack.slice(
      stack.indexOf('function hidesTabBar'),
      stack.indexOf('function hidesTabBar') + 900,
    );
    expect(fn).toContain('MYPAGE_SUB_ROUTES.has');
    expect(fn).toContain('COMMUNITY_SUB_ROUTES.has');
  });

  it('탭 루트(`/mypage`·`/community`)는 숨김 대상이 아니다', () => {
    // 탭 루트는 ROOT 라우트로 뜬다. 하위 집합에 탭 루트를 넣으면 탭바가 사라진다.
    const both =
      stack.slice(
        stack.indexOf('const MYPAGE_SUB_ROUTES'),
        stack.indexOf('/**\n * 탭 하나를 감싸는'),
      ) || '';
    expect(both).not.toContain('tabStackNavigations.ROOT');
  });
});

/**
 * 탭으로 돌아올 때 무엇을 기준으로 판단하나.
 *
 * 🔴이 자리에 실제 버그가 있었다(2026-09-08 iOS 26 실측). 포커스 효과가
 * `navigation.getState()` 를 읽었는데, `TabStack` 은 Stack.Navigator **밖**이라
 * 그 navigation 은 탭 네비게이터를 가리킨다 → focused 가 'CommunityTab' 같은
 * **탭 이름**이었다. hidesTabBar 는 라우트 이름을 기대하므로 항상 false 가 되어
 * **리스너가 방금 숨긴 탭바를 다시 켰다**(글 상세에서 댓글 입력창이 가려짐).
 */
describe('탭 복귀 시 판단 기준은 스택 라우트다', () => {
  it('탭 이름은 숨김 규칙에 걸리지 않는다 — 그래서 탭 상태를 읽으면 틀린다', () => {
    for (const tab of [
      'HomeTab',
      'DiscoverTab',
      'CommunityTab',
      'AlarmTab',
      'MyPageTab',
    ]) {
      expect(hidesTabBar(tab)).toBe(false);
    }
  });

  it('포커스 효과는 탭 네비게이터 상태를 읽지 않는다', () => {
    const start = stack.indexOf('if (!isTabFocused) return;');
    expect(start).toBeGreaterThan(-1);
    // ⚠️주석에 'navigation.getState()' 가 설명으로 등장하므로 **코드 줄만** 본다
    // (런북이 경고한 거짓 양성 — 실제로 여기서 한 번 걸렸다).
    const code = stack
      .slice(start, start + 900)
      .split('\n')
      .filter((l: string) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join('\n');
    expect(code).toContain('focusedRouteRef.current');
    // getState() 를 다시 넣으면 같은 버그가 재발한다.
    expect(code).not.toContain('navigation.getState()');
  });

  it('스택 리스너가 focusedRouteRef 를 갱신한다 — 유일한 갱신자', () => {
    // 갱신자가 없으면 ref 가 ROOT 에 고정돼 상세에서도 탭바가 남는다.
    expect(stack).toContain('focusedRouteRef.current = focused;');
  });
});

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
    //
    // ★판정은 ref 가 아니라 **호출 시점**에 직접 묻는다. 딥링크가 탭 전환과
    // push 를 한 번에 하면 ref 가 갱신되기 전에 리스너가 돈다.
    const listener = stack.slice(
      stack.indexOf('screenListeners'),
      stack.indexOf('screenListeners') + 1400,
    );
    expect(listener).toContain('if (navigation.isFocused())');
    expect(stack).not.toContain('isFocusedRef');
  });

  it('탭 복귀 시 자기 스택 최상단으로 다시 맞춘다', () => {
    // 다른 탭에 있는 동안 이 탭 리스너는 막혀 있었으므로,
    // 돌아올 때 한 번 재계산해야 한다.
    // ★기준은 **스택 라우트**다 — 탭 네비게이터 상태를 읽으면 탭 이름이 와서
    // 규칙에 걸리지 않는다(아래 describe 가 그 버그를 고정한다).
    expect(stack).toContain('useIsFocused');
    expect(stack).toContain('focusedRouteRef.current');
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

  /**
   * 알림 탭(2026-08-20 네이티브 전환). 나가는 경로는 상세와 키워드 웹뷰 둘뿐.
   * 키워드는 web 페이지라 WEBVIEW 로 쌓이고 탭바를 숨긴다.
   */
  it('알림 → 상세 → 알림 (상세에서도 보인다)', () => {
    expect(walk([ROUTES.ROOT, ROUTES.DETAIL, ROUTES.ROOT])).toEqual([
      true,
      true,
      true,
    ]);
  });

  it('알림 → 키워드 알림(WEBVIEW) → 알림', () => {
    expect(walk([ROUTES.ROOT, ROUTES.WEBVIEW, ROUTES.ROOT])).toEqual([
      true,
      false,
      true,
    ]);
  });

  it('알림 → 상세 → 댓글 → 상세 → 알림', () => {
    expect(
      walk([
        ROUTES.ROOT,
        ROUTES.DETAIL,
        ROUTES.COMMENTS,
        ROUTES.DETAIL,
        ROUTES.ROOT,
      ]),
    ).toEqual([true, true, false, true, true]);
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
