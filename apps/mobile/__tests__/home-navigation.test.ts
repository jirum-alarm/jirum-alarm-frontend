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

  it('WEBVIEW 라우트가 탭 스택에 등록돼 있다', () => {
    expect(routes).toContain('WEBVIEW:');
    expect(stack).toContain('tabStackNavigations.WEBVIEW');
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
