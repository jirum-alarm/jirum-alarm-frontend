/**
 * 홈에서 나가는 경로.
 *
 * 둘 다 "탭 구조 안에 머물러야" 한다 — 인앱 브라우저로 띄우면 앱 밖으로
 * 나간 것처럼 보이고 탭바·뒤로가기가 사라진다(사용자 지적).
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const screen = read('src/screens/home/HomeScreen.tsx');
const routes = read('src/shared/constant/navigations.ts');
const stack = read('src/navigations/tab/TabStackNavigator.tsx');

describe('섹션 더보기 — 탭 스택에 쌓는다', () => {
  it('인앱 브라우저를 쓰지 않는다', () => {
    expect(screen).not.toContain('openInAppBrowser');
  });

  it('WEBVIEW 라우트로 push 한다', () => {
    expect(screen).toContain('tabStackNavigations.WEBVIEW');
    expect(screen).toContain('navigation.push');
  });

  it('★uri 는 경로만 — SERVICE_URL 을 붙이지 않는다', () => {
    // JirumAlarmWebViewScreen 이 `${SERVICE_URL}${uri}` 로 조립한다.
    // 호출부에서 또 붙이면 "...comhttps://..." 가 되어 페이지를 못 불러온다.
    const webviewScreen = read(
      'src/screens/jirumalarmwebview/JirumAlarmWebViewScreen.tsx',
    );
    expect(webviewScreen).toContain('${SERVICE_URL}${uri}');
    expect(screen).toContain('{uri: link, title}');
    expect(screen).not.toContain('uri: `${SERVICE_URL}${link}`');
  });

  it('WEBVIEW 라우트가 탭 스택에 등록돼 있다', () => {
    expect(routes).toContain('WEBVIEW:');
    expect(stack).toContain('tabStackNavigations.WEBVIEW');
  });

  it('★네이티브 헤더를 띄우지 않는다 — web 이 자체 헤더를 갖는다', () => {
    // /toss·/curation 은 제목·뒤로가기·검색·공유를 web 이 그린다.
    // headerShown: true 로 두면 헤더가 두 개로 겹친다.
    const start = stack.indexOf('name={tabStackNavigations.WEBVIEW}');
    const block = stack.slice(start, start + 400);
    expect(block).toContain('headerShown: false');
  });
});

describe('★탭이 이미 가진 화면은 스택에 쌓지 않는다', () => {
  it('랭킹 더보기 = 발견 탭 이동(스택 push 아님)', () => {
    // /trending/* 은 발견 탭의 화면이다. /curation/* 처럼 스택에 쌓으면
    // 같은 화면이 두 겹으로 존재하고 탭 구조가 어긋난다(사용자 지적).
    expect(screen).toContain('handlePressRanking');
    expect(screen).toContain('goDiscoverTab');
    // 랭킹을 WEBVIEW 로 push 하지 않는다
    expect(screen).not.toContain("handlePressViewMore('/trending/ranking'");
  });

  it('실시간·랭킹이 같은 헬퍼를 쓴다', () => {
    // 발견 탭이 네이티브가 된 뒤로는 URL 이 아니라 화면 이름을 넘긴다.
    expect(screen).toContain("goDiscoverTab('live')");
    expect(screen).toContain("goDiscoverTab('ranking')");
  });
});

describe('더보기 웹뷰 안에서 상품을 눌렀을 때', () => {
  const logic = read(
    'src/screens/jirumalarmwebview/hooks/useCommonWebViewLogic.ts',
  );

  it('★★상품 상세는 웹뷰가 아니라 네이티브로 올린다', () => {
    // 토스 특가 웹뷰에서 상품을 누르면 웹뷰가 또 쌓여 네이티브 상세의
    // CTA·차트·공유가 전부 사라졌다(사용자 지적).
    expect(logic).toContain('getPushablePath');
    expect(logic).toContain('tabStackNavigations.DETAIL');
  });

  it('SPA 라우팅과 문서 로드 두 경로 모두 잡는다', () => {
    // ROUTE_CHANGED(web pushState) + onShouldStartLoadWithRequest(문서 로드)
    expect(logic).toContain('ROUTE_CHANGED');
    expect(logic).toContain('handleShouldStartLoadWithRequest');
    // 두 곳에서 각각 판정한다
    expect(logic.match(/getPushablePath/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('★탭 스택 안이면 탭 스택 라우트로 쌓는다', () => {
    // MainStack 라우트로 쌓으면 탭 밖으로 나가 하단 탭바가 다시 뜬다.
    expect(logic).toContain('isInTabStack');
    expect(logic).toContain('tabStackNavigations.WEBVIEW');
  });

  it('WEBVIEW 라우트가 탭바 숨김 목록에 있다', () => {
    // 화면별 훅이 아니라 라우트 이름으로 정한다(hidesTabBar).
    expect(stack).toContain('hidesTabBar');
    const fn = stack.slice(
      stack.indexOf('function hidesTabBar'),
      stack.indexOf('function hidesTabBar') + 700,
    );
    expect(fn).toContain('tabStackNavigations.WEBVIEW');
  });
});

describe('실시간 특가 더 보기 — 발견 탭의 live 화면', () => {
  it('★탭만 바꾸지 않는다 — 발견 탭은 마지막에 보던 화면을 유지한다', () => {
    // 발견 탭이 네이티브가 된 뒤에도 "어느 화면으로" 를 정해줘야 한다.
    // 탭만 바꾸면 유저가 마지막에 보던 실시간/랭킹이 그대로 뜬다.
    expect(screen).toContain('requestTrendingView');
    expect(screen).toContain('tabNavigations.DISCOVER');
  });

  it('★요청을 먼저 넣고 탭을 바꾼다 — 순서가 바뀌면 화면이 깜빡인다', () => {
    // 탭을 먼저 바꾸면 화면이 이전 view 로 한 번 렌더된 뒤 바뀐다.
    const body = screen.slice(
      screen.indexOf('const goDiscoverTab'),
      screen.indexOf('const handlePressLiveDeals'),
    );
    expect(body.indexOf('requestTrendingView')).toBeGreaterThan(-1);
    expect(body.indexOf('requestTrendingView')).toBeLessThan(
      body.indexOf('tabs?.navigate'),
    );
  });

  it('★웹뷰 주입은 더 이상 쓰지 않는다 — 주입할 웹뷰가 없다', () => {
    // 주석의 경위 설명은 남아 있어도 되지만 **호출**은 없어야 한다.
    expect(screen).not.toContain('.injectJavaScript(');
    expect(screen).not.toContain('getWebViewRef(');
  });
});

export {};
