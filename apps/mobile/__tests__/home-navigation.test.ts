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
    const block = stack.slice(
      stack.indexOf('tabStackNavigations.WEBVIEW'),
      stack.indexOf('tabStackNavigations.COMMENTS'),
    );
    expect(block).toContain('headerShown: false');
  });
});

describe('더보기 웹뷰 안에서 상품을 눌렀을 때', () => {
  const logic = read(
    'src/screens/jirumalarmwebview/hooks/useCommonWebViewLogic.ts',
  );

  it('★탭 스택 안이면 탭 스택 라우트로 쌓는다', () => {
    // MainStack 라우트로 쌓으면 탭 밖으로 나가 하단 탭바가 다시 뜬다.
    expect(logic).toContain('isInTabStack');
    expect(logic).toContain('tabStackNavigations.WEBVIEW');
  });

  it('WEBVIEW 화면이 탭바를 숨긴다', () => {
    // useHideTabBar 주석의 "상세 하위 웹뷰 → 안 떠야 함" 사례.
    expect(stack).toContain('useHideTabBar()');
  });
});

describe('실시간 특가 더 보기 — 발견 탭의 live 화면', () => {
  it('★탭만 바꾸지 않는다 — 그 탭 기본 URL 은 랭킹이다', () => {
    // getTabBaseUrl(DISCOVER) === '/trending/ranking' 이라
    // 탭 전환만 하면 랭킹이 뜬다.
    const routing = read('src/shared/lib/navigation/tab-routing.ts');
    expect(routing).toContain("'/trending/ranking'");
    expect(screen).toContain('/trending/live');
  });

  it('발견 탭으로 전환한 뒤 URL 을 주입한다', () => {
    expect(screen).toContain('tabNavigations.DISCOVER');
    expect(screen).toContain('injectJavaScript');
  });
});

export {};
