import {
  getPushablePath,
  getTabNameFromUrl,
  isTabRootUrl,
} from '../src/shared/lib/navigation/tab-routing';
import {tabNavigations} from '../src/shared/constant/navigations';

describe('getPushablePath', () => {
  it('상품 상세는 push 경로를 돌려준다', () => {
    expect(getPushablePath('https://jirum-alarm.com/products/123')).toBe(
      '/products/123',
    );
  });

  it('상세 하위 경로도 같은 스택에 쌓는다', () => {
    expect(
      getPushablePath('https://jirum-alarm.com/products/123/comment'),
    ).toBe('/products/123/comment');
  });

  it('쿼리를 잃지 않는다 — extractPath 는 버리므로 별도 처리한 부분', () => {
    expect(
      getPushablePath('https://jirum-alarm.com/products/123?from=home'),
    ).toBe('/products/123?from=home');
  });

  it('목록·탭 루트는 push 하지 않는다 (기존 웹뷰 유지)', () => {
    expect(getPushablePath('https://jirum-alarm.com/')).toBeNull();
    expect(
      getPushablePath('https://jirum-alarm.com/trending/ranking'),
    ).toBeNull();
    expect(getPushablePath('https://jirum-alarm.com/community')).toBeNull();
  });

  it('/products 목록 자체는 상세가 아니다', () => {
    expect(getPushablePath('https://jirum-alarm.com/products')).toBeNull();
  });

  it('숫자가 아닌 하위는 상세로 보지 않는다', () => {
    expect(getPushablePath('https://jirum-alarm.com/products/new')).toBeNull();
  });
});

describe('isTabRootUrl', () => {
  it('커뮤니티 목록은 루트다', () => {
    expect(isTabRootUrl('https://jirum-alarm.com/community')).toBe(true);
    expect(isTabRootUrl('https://jirum-alarm.com/community?tab=all')).toBe(
      true,
    );
  });

  it('트레일링 슬래시도 루트로 본다 — 아니면 탭바가 숨고 safe-area 가 빠진다', () => {
    expect(isTabRootUrl('https://jirum-alarm.com/community/')).toBe(true);
  });

  it('게시글 상세는 루트가 아니다', () => {
    expect(isTabRootUrl('https://jirum-alarm.com/community/77')).toBe(false);
  });
});

/**
 * push 조건의 플랫폼 분기 회귀 가드.
 *
 * react-native-webview 는 Android 에서 navigationType 이 항상 'other' 다
 * (WebViewTypes.d.ts). 그래서 'click' 을 요구하면 Android 는 상세 push 가
 * 영영 안 걸린다. TabWebView 의 조건이 iOS 로 한정돼 있는지 소스로 검사한다.
 * (TabWebView 는 RN 컴포넌트라 여기서 직접 require 할 수 없어 텍스트로 본다.)
 */
describe('상세 push 조건', () => {
  const src: string = require('fs').readFileSync(
    require('path').resolve(process.cwd(), 'src/screens/tabs/TabWebView.tsx'),
    'utf8',
  );

  it("navigationType === 'click' 을 iOS 로 한정한다", () => {
    expect(src).toMatch(
      /Platform\.OS\s*!==\s*'ios'\s*\|\|\s*event\.navigationType\s*===\s*'click'/,
    );
  });

  it('플랫폼 분기 없이 click 만 요구하지 않는다', () => {
    expect(src).not.toMatch(
      /if\s*\([^)]*event\.navigationType\s*===\s*'click'\s*\)/,
    );
  });

  it('탭 루트가 아니면 --bottom-nav-padding 을 0 으로 덮어쓴다', () => {
    expect(src).toMatch(/isTabRootUrl\(navState\.url\)/);
    expect(src).toMatch(/buildNativeTabsInjectJs\(bottomNavVars\)/);
    expect(src).toMatch(/navState\.url, bottomNavVars/);
  });

  it('웹뷰는 clip 높이로 입력창을 올리지 않는다', () => {
    expect(src).not.toMatch(/getTabBarClipPx/);
  });
});

describe('iOS 26 탭바 clip', () => {
  const stackSrc: string = require('fs').readFileSync(
    require('path').resolve(
      process.cwd(),
      'src/navigations/tab/TabStackNavigator.tsx',
    ),
    'utf8',
  );
  const nativeSrc: string = require('fs').readFileSync(
    require('path').resolve(
      process.cwd(),
      'src/navigations/tab/createNativeBottomTabNavigator.tsx',
    ),
    'utf8',
  );

  it('웹뷰 루트는 clip 하지 않고, 네이티브 push 화면만 자른다', () => {
    expect(stackSrc).toMatch(
      /tabBarClipWhenHidden:\s*!visible && clipWhenHidden/,
    );
    expect(stackSrc).toMatch(
      /apply\(routeName !== tabStackNavigations\.ROOT\)/,
    );
  });

  it('숨겼다고 무조건 자르지 않는다', () => {
    expect(nativeSrc).toMatch(/hidden && options\?\.tabBarClipWhenHidden/);
    expect(nativeSrc).not.toMatch(/const clipPx = hidden \? getTabBarClipPx/);
  });
});

describe('getTabNameFromUrl — 탭 귀속', () => {
  const at = (path: string) =>
    getTabNameFromUrl(`https://jirum-alarm.com${path}`);

  it('/themes 는 내정보 소속이다 — 기본값(HOME)으로 떨어지면 탭 밖으로 튕긴다', () => {
    expect(at('/themes')).toBe(tabNavigations.MYPAGE);
    expect(at('/themes/12')).toBe(tabNavigations.MYPAGE);
  });

  it('기존 귀속은 그대로', () => {
    expect(at('/')).toBe(tabNavigations.HOME);
    expect(at('/trending/ranking')).toBe(tabNavigations.DISCOVER);
    expect(at('/community')).toBe(tabNavigations.COMMUNITY);
    expect(at('/alarm')).toBe(tabNavigations.ALARM);
    expect(at('/mypage')).toBe(tabNavigations.MYPAGE);
    expect(at('/mypage/keyword')).toBe(tabNavigations.MYPAGE);
    expect(at('/like')).toBe(tabNavigations.MYPAGE);
    expect(at('/products/123')).toBe(tabNavigations.HOME);
  });
});
