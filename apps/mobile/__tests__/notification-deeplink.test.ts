export {};

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
const mockRequestTrendingView = jest.fn();
let mockReady = true;

/** 로그인 상태 = 탭 네비게이터가 루트. 비로그인은 AuthNavigator 라 탭이 없다. */
const TAB_STATE = {
  routeNames: [
    'HomeTab',
    'DiscoverTab',
    'CommunityTab',
    'AlarmTab',
    'MyPageTab',
  ],
};
const AUTH_STATE = {routeNames: ['AuthHome', 'AuthEmailLogin']};
let mockRootState: unknown = TAB_STATE;

jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: () => ({
    isReady: () => mockReady,
    navigate: mockNavigate,
    getRootState: () => mockRootState,
    dispatch: mockDispatch,
  }),
  // 하위 화면은 중첩 스택 상태를 직접 지정한다(뒤로가기 보존).
  // 액션을 그대로 들여다볼 수 있게 얇게 통과시킨다.
  CommonActions: {navigate: (arg: unknown) => ({type: 'NAVIGATE', arg})},
}));

jest.mock('../src/screens/trending/trending-view-store', () => ({
  requestTrendingView: (...args: unknown[]) => mockRequestTrendingView(...args),
}));

const {
  areNativeTabsMounted,
  navigateToNativeRoute,
  navigateToTrending,
} = require('../src/navigations/navigation-ref');

const url = (path: string) => `https://jirum-alarm.com${path}`;
const webViewOn = {allowWebViewRoute: true};

/** 탭 루트로 가는 이동. `navigate(tab, {screen: 'TabRoot'})` 한 번. */
const expectTabRoot = (tab: string) => {
  expect(mockNavigate).toHaveBeenCalledWith(tab, {screen: 'TabRoot'});
};

/**
 * 하위 화면으로 가는 이동.
 *
 * 🔴라우트 배열에 **탭 루트가 먼저** 와야 한다. 없으면 그 화면이 스택의 유일한
 * 라우트가 되어 **뒤로가기가 사라진다**(iOS 26 실측: 푸시로 커뮤니티 글을 열면
 * 목록으로 돌아갈 길이 없었다).
 */
const expectScreen = (tab: string, screen: string, params?: unknown) => {
  const call = mockDispatch.mock.calls.at(-1)?.[0] as {
    arg?: {name?: string; params?: {state?: {routes?: unknown[]}}};
  };
  expect(call?.arg?.name).toBe(tab);
  expect(call?.arg?.params?.state?.routes).toEqual([
    {name: 'TabRoot'},
    {name: screen, params},
  ]);
};

/** 중첩 네비게이터(검색) 목적지. 부모 라우트 안의 자식 state 를 본다. */
const expectNested = (
  tab: string,
  screen: string,
  child: string,
  childParams?: unknown,
) => {
  const call = mockDispatch.mock.calls.at(-1)?.[0] as {
    arg?: {name?: string; params?: {state?: {routes?: unknown[]}}};
  };
  expect(call?.arg?.name).toBe(tab);
  expect(call?.arg?.params?.state?.routes).toEqual([
    {name: 'TabRoot'},
    {
      name: screen,
      params: undefined,
      state: {routes: [{name: child, params: childParams}]},
    },
  ]);
};

const reset = () => {
  mockNavigate.mockClear();
  mockDispatch.mockClear();
  mockRequestTrendingView.mockClear();
  mockReady = true;
  mockRootState = TAB_STATE;
};

describe('푸시·딥링크 → 네이티브 화면', () => {
  beforeEach(reset);

  it('상품 상세는 URL 이 정한 탭의 스택에 쌓는다', () => {
    expect(navigateToNativeRoute(url('/products/123'))).toBe(true);
    expectScreen('HomeTab', 'ProductDetail', {path: '/products/123'});
  });

  // 🔴상세보다 먼저 판정해야 한다. `getPushablePath` 가 `/comment` 까지 잡아서
  // 상세로 보내면 상세 화면이 `/products/\d+$` 만 네이티브로 그려 **웹뷰 폴백**으로
  // 떨어졌다 — 네이티브 댓글 화면이 있는데 공유·푸시로 온 사람만 web 을 봤다.
  it('상품 댓글은 네이티브 댓글 화면으로 — 상세 폴백으로 새지 않는다', () => {
    expect(navigateToNativeRoute(url('/products/123/comment'))).toBe(true);
    expectScreen('HomeTab', 'ProductComments', {productId: 123});
  });

  it('끝 슬래시도 같은 화면', () => {
    navigateToNativeRoute(url('/products/123/comment/'));
    expectScreen('HomeTab', 'ProductComments', {productId: 123});
  });

  it('네이티브 화면이 없는 하위 경로는 그대로 상세가 받는다', () => {
    // `/related` 는 아직 네이티브가 없다 — 상세 화면의 웹뷰 폴백이 맡는다.
    expect(navigateToNativeRoute(url('/products/123/related'))).toBe(true);
    expectScreen('HomeTab', 'ProductDetail', {path: '/products/123/related'});
  });

  it('쿼리스트링을 살려서 넘긴다', () => {
    navigateToNativeRoute(url('/products/123?utm=push'));
    expectScreen('HomeTab', 'ProductDetail', {path: '/products/123?utm=push'});
  });

  // ★여기부터가 고친 것 — 예전엔 상세·발견 말고는 전부 웹뷰 주입으로 떨어졌고,
  // 홈·알림 탭엔 주입할 웹뷰가 없어 **아무 일도 일어나지 않았다.**
  it('홈은 홈 탭 루트로 — 스택에 쌓인 상세까지 걷힌다', () => {
    expect(navigateToNativeRoute(url('/'))).toBe(true);
    expectTabRoot('HomeTab');
  });

  it('알림함은 알림 탭 루트로', () => {
    expect(navigateToNativeRoute(url('/alarm'))).toBe(true);
    expectTabRoot('AlarmTab');
  });

  it('발견 탭은 어느 view 인지까지 지정한다 — 탭 전환보다 먼저', () => {
    expect(navigateToNativeRoute(url('/trending/ranking'))).toBe(true);
    expect(mockRequestTrendingView).toHaveBeenCalledWith('ranking');
    expectTabRoot('DiscoverTab');
    // 요청이 탭 전환보다 먼저 들어가야 첫 렌더부터 맞는 화면이 뜬다.
    expect(mockRequestTrendingView.mock.invocationCallOrder[0]).toBeLessThan(
      mockNavigate.mock.invocationCallOrder[0],
    );
  });

  it('/trending 은 web 리다이렉트와 같이 실시간이 기본', () => {
    navigateToNativeRoute(url('/trending'));
    expect(mockRequestTrendingView).toHaveBeenCalledWith('live');
  });

  it('큐레이션 더보기는 네이티브 목록으로', () => {
    expect(navigateToNativeRoute(url('/curation/under-10000'))).toBe(true);
    expectScreen('HomeTab', 'Curation', {sectionId: 'under-10000'});
  });

  it('토스 특가는 ?tab= 을 섹션으로 넘긴다', () => {
    navigateToNativeRoute(url('/toss?tab=food'));
    expectScreen('HomeTab', 'TossCuration', {sectionId: 'food'});

    reset();
    navigateToNativeRoute(url('/toss'));
    expectScreen('HomeTab', 'TossCuration', {});
  });
});

// ★내정보 13개·커뮤니티 3개 라우트를 한 번에 냈다. 하나라도 매핑이 빠지면
// 그 화면만 웹 버전으로 떨어져 "같은 화면인데 진입 경로에 따라 다르다"가 된다.
describe('커뮤니티·내정보 딥링크 (2026-09-08 네이티브 전환)', () => {
  beforeEach(reset);

  it('탭 루트 두 개', () => {
    expect(navigateToNativeRoute(url('/community'))).toBe(true);
    expectTabRoot('CommunityTab');
    reset();
    expect(navigateToNativeRoute(url('/mypage'))).toBe(true);
    expectTabRoot('MyPageTab');
  });

  it('끝 슬래시가 붙어도 같은 화면', () => {
    navigateToNativeRoute(url('/mypage/'));
    expectTabRoot('MyPageTab');
  });

  it('탭 루트로 가는 링크는 dispatch 를 쓰지 않는다', () => {
    navigateToNativeRoute(url('/community'));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('커뮤니티 글 상세는 postId 를 숫자로 넘긴다', () => {
    // 화면 파라미터 타입이 number 다 — 문자열로 넘기면 조회가 빈다.
    expect(navigateToNativeRoute(url('/community/1234'))).toBe(true);
    expectScreen('CommunityTab', 'CommunityPost', {postId: 1234});
  });

  it('/community/write 는 글 상세로 오해되지 않는다', () => {
    // 표를 먼저 보므로 `write` 가 id 자리로 들어가지 않는다.
    expect(navigateToNativeRoute(url('/community/write'))).toBe(true);
    expectScreen('CommunityTab', 'CommunityWrite', {});
  });

  it('내정보 하위 7개가 각자 제 화면으로 간다', () => {
    const cases: Array<[string, string]> = [
      ['/mypage/account', 'MyPageAccount'],
      ['/mypage/account/nickname', 'MyPageNickname'],
      ['/mypage/account/password', 'MyPagePassword'],
      ['/mypage/account/personal', 'MyPagePersonal'],
      ['/mypage/categories', 'MyPageCategories'],
      ['/mypage/keyword', 'MyPageKeyword'],
      ['/mypage/terms-policies', 'MyPageTerms'],
    ];
    for (const [path, screen] of cases) {
      reset();
      expect(navigateToNativeRoute(url(path))).toBe(true);
      expectScreen('MyPageTab', screen, undefined);
    }
  });

  it('찜·테마 목록', () => {
    expect(navigateToNativeRoute(url('/like'))).toBe(true);
    expectScreen('MyPageTab', 'Like', undefined);
    reset();
    navigateToNativeRoute(url('/themes'));
    expectScreen('MyPageTab', 'Themes', undefined);
  });

  it('테마 상세는 id 를 문자열로 넘긴다', () => {
    // 숫자로 좁히면 슬러그형 id 가 통째로 안 열린다.
    expect(navigateToNativeRoute(url('/themes/apple-2026'))).toBe(true);
    expectScreen('MyPageTab', 'ThemeDetail', {themeId: 'apple-2026'});
  });

  it('약관·개인정보는 한 화면이 kind 로 갈린다', () => {
    navigateToNativeRoute(url('/policies/terms'));
    expectScreen('MyPageTab', 'Policy', {kind: 'terms'});
    reset();
    navigateToNativeRoute(url('/policies/privacy'));
    expectScreen('MyPageTab', 'Policy', {kind: 'privacy'});
  });
});

// 🔴검색은 2026-09-08 로 본문까지 네이티브가 됐다. 매핑이 없으면 이 경로가 웹뷰
// 폴백으로 떨어져 **이제 낡은 web 검색 페이지**가 떴다.
describe('검색 딥링크', () => {
  beforeEach(reset);

  it('검색어 없이 열면 초기 화면으로', () => {
    expect(navigateToNativeRoute(url('/search'))).toBe(true);
    expectNested('HomeTab', 'Search', 'SearchHome', undefined);
  });

  it('keyword 를 중첩 자식까지 넘긴다', () => {
    // 중첩 네비게이터 라우트에 params 만 얹으면 자식 화면엔 안 닿는다.
    expect(navigateToNativeRoute(url('/search?keyword=%EB%9E%A8'))).toBe(true);
    expectNested('HomeTab', 'Search', 'SearchHome', {keyword: '램'});
  });

  it('`+` 는 공백으로 읽는다 — web URLSearchParams 와 같은 규칙', () => {
    // 안 맞추면 "갤럭시 워치" 가 `+` 를 품은 채로 조회된다.
    navigateToNativeRoute(
      url('/search?keyword=%EA%B0%A4%EB%9F%AD%EC%8B%9C+%EC%9B%8C%EC%B9%98'),
    );
    expectNested('HomeTab', 'Search', 'SearchHome', {keyword: '갤럭시 워치'});
  });

  it('빈 keyword 는 초기 화면으로 — 빈 문자열로 조회하지 않는다', () => {
    navigateToNativeRoute(url('/search?keyword='));
    expectNested('HomeTab', 'Search', 'SearchHome', undefined);
  });
});

describe('네이티브 화면이 없는 경로', () => {
  beforeEach(reset);

  // 네이티브 탭엔 주입할 웹뷰가 없다 → 그 탭 스택에 웹 페이지를 쌓아 반드시 보이게.
  it('푸시·딥링크는 그 탭 스택의 웹뷰 화면으로 쌓는다', () => {
    expect(navigateToNativeRoute(url('/deals/apple-2026'), webViewOn)).toBe(
      true,
    );
    // ★경로만. JirumAlarmWebViewScreen 이 SERVICE_URL 을 붙이므로
    // 절대 URL 을 넘기면 두 번 겹친다.
    expectScreen('HomeTab', 'TabWebViewPage', {uri: '/deals/apple-2026'});
  });

  it('쿼리도 살린다', () => {
    navigateToNativeRoute(url('/recommend?from=push'), webViewOn);
    expectScreen('HomeTab', 'TabWebViewPage', {uri: '/recommend?from=push'});
  });

  // 웹뷰 안 링크 클릭은 폴백을 끈다 — 켜면 링크를 눌렀을 뿐인데 탭이 바뀐다.
  it('폴백을 끄면 false 를 돌려 호출부 판단에 맡긴다', () => {
    expect(navigateToNativeRoute(url('/deals/apple-2026'))).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  // ★2026-09-08 로 다섯 탭 전부 네이티브가 됐다 — 웹뷰 루트를 가진 탭이 더는
  // 없으므로, 매핑에 없는 경로는 **어느 탭이든** 웹뷰 라우트로 쌓는다.
  it('매핑에 없는 하위 경로도 그 탭 스택의 웹뷰로 쌓는다', () => {
    expect(navigateToNativeRoute(url('/mypage/unknown-page'), webViewOn)).toBe(
      true,
    );
    expectScreen('MyPageTab', 'TabWebViewPage', {uri: '/mypage/unknown-page'});
  });
});

describe('areNativeTabsMounted — 기다릴지 넘길지 가른다', () => {
  beforeEach(reset);

  // 호출부(useDeepLink)는 "아직 준비 안 됨"과 "네이티브 화면 없음"을 구분해야
  // 한다. 둘 다 false 를 받지만, 앞은 재시도하고 뒤는 곧장 웹뷰로 넘긴다.
  it('탭이 있으면 true', () => {
    expect(areNativeTabsMounted()).toBe(true);
  });

  it('로그인 전(탭 없음)·상태 없음이면 false', () => {
    mockRootState = AUTH_STATE;
    expect(areNativeTabsMounted()).toBe(false);
    mockRootState = undefined;
    expect(areNativeTabsMounted()).toBe(false);
  });
});

describe('실패는 조용히 웹뷰로 넘긴다', () => {
  beforeEach(reset);

  // 🔴react-navigation 은 처리 못 하는 navigate 를 던지지 않고 콘솔 에러만 찍는다.
  // 그래서 try/catch 로는 안 잡히고, true 를 돌려주면 호출부가 웹뷰 폴백까지
  // 건너뛰어 링크가 통째로 사라진다. 로그인 전(AuthNavigator)에 실제로 걸렸다.
  it('탭이 없는 상태(로그인 전)면 이동을 시도하지 않는다', () => {
    mockRootState = AUTH_STATE;
    expect(navigateToNativeRoute(url('/products/123'), webViewOn)).toBe(false);
    expect(navigateToNativeRoute(url('/alarm'), webViewOn)).toBe(false);
    expect(navigateToNativeRoute(url('/'), webViewOn)).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('네비게이션 상태가 아직 없으면 false', () => {
    mockRootState = undefined;
    expect(navigateToNativeRoute(url('/alarm'), webViewOn)).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('탭이 중첩 네비게이터 안에 있어도 찾는다', () => {
    mockRootState = {routeNames: ['Main'], routes: [{state: TAB_STATE}]};
    expect(navigateToNativeRoute(url('/alarm'))).toBe(true);
  });

  // 콜드 스타트에서 네비게이터가 아직 안 떴을 때 무리하게 push 하면 안 된다.
  it('네비게이터가 준비 안 됐으면 false', () => {
    mockReady = false;
    expect(navigateToNativeRoute(url('/products/123'), webViewOn)).toBe(false);
    expect(navigateToNativeRoute(url('/alarm'), webViewOn)).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('dispatch 가 던져도 false 로 삼켜 웹뷰 폴백을 살린다', () => {
    mockDispatch.mockImplementationOnce(() => {
      throw new Error('navigator not mounted');
    });
    expect(navigateToNativeRoute(url('/products/123'))).toBe(false);
  });

  it('navigate 가 던져도 false 로 삼킨다(탭 루트 경로)', () => {
    mockNavigate.mockImplementationOnce(() => {
      throw new Error('navigator not mounted');
    });
    expect(navigateToNativeRoute(url('/alarm'))).toBe(false);
  });
});

describe('navigateToTrending — 웹뷰 안 링크 전용 입구', () => {
  beforeEach(reset);

  it('/trending 만 가져간다', () => {
    expect(navigateToTrending(url('/trending/live'))).toBe(true);
    expectTabRoot('DiscoverTab');
  });

  it('다른 경로는 건드리지 않는다 — 웹뷰가 그대로 이동한다', () => {
    expect(navigateToTrending(url('/products/123'))).toBe(false);
    expect(navigateToTrending(url('/'))).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
