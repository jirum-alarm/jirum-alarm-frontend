/**
 * 탭바 표시 상태. 3곳이 맞물려 있어 한 곳만 고치면 다른 쪽이 깨진다
 * (hideCount · 내비게이터 clip · 화면 패딩).
 *
 * 이 파일은 그 계약을 소스 텍스트로 고정한다 — 실제 훅은 네비게이션
 * 컨텍스트가 필요해 단독 렌더가 안 된다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const hook = read('src/shared/hooks/useHideTabBar.ts');
const navigator = read(
  'src/navigations/tab/createNativeBottomTabNavigator.tsx',
);
const home = read('src/screens/home/HomeScreen.tsx');

describe('hideCount 는 카운터다', () => {
  it('boolean 이 아니라 숫자 — (다음 focus)→(이전 cleanup) 순서 때문', () => {
    expect(hook).toContain('hideCount = {current: 0}');
    expect(hook).toContain('setHideCount(hideCount.current + 1)');
    expect(hook).toContain('setHideCount(hideCount.current - 1)');
  });

  it('음수로 내려가지 않는다', () => {
    expect(hook).toContain('Math.max(0, next)');
  });
});

describe('★★탭바 표시는 라우트 이름 하나로 정한다', () => {
  const stack = read('src/navigations/tab/TabStackNavigator.tsx');

  it('스택 리스너가 포커스된 라우트로 결정한다', () => {
    // 화면마다 useHideTabBar 를 걸면 focus/cleanup 순서에 의존해 카운터가
    // 샌다 — 탭 5개가 같은 스택을 각자 갖고 있어 특히 그렇다.
    // 라우트는 언제나 정확히 하나라 어긋날 수 없다.
    expect(stack).toContain('hidesTabBar');
    expect(stack).toContain('setTabBarVisible(!hidesTabBar(focused))');
  });

  it('숨기는 라우트 5개가 빠짐없이 들어 있다', () => {
    for (const name of [
      'DETAIL',
      'COMMENTS',
      'SEARCH',
      'CURATION',
      'WEBVIEW',
    ]) {
      expect(stack).toContain(`tabStackNavigations.${name}`);
    }
  });

  it('화면별 훅은 더 이상 쓰지 않는다', () => {
    expect(home).not.toContain('useShowTabBar()');
    expect(home).not.toMatch(/^import .*setTabBarVisible/m);
  });
});

describe('★setTabBarVisible 직접 호출 금지', () => {
  it('직접 호출은 스택 리스너 한 곳으로 제한된다', () => {
    // 직접 부르면 hideCount 를 무시한다. 탭 웹뷰가 그랬더니 더보기 웹뷰에서
    // 홈으로 돌아왔을 때 탭바가 영영 안 돌아왔다(사용자 지적).
    const {execSync} = require('child_process');
    const out = execSync(
      "grep -rn 'setTabBarVisible(' src/ | grep -v 'useHideTabBar.ts' " +
        "| grep -v 'useTabBarVisibility.ts' | grep -v '^\\s*\\*' || true",
      {cwd: path.join(__dirname, '..'), encoding: 'utf8'},
    );
    // 라우트 기반으로 바꾼 뒤 정당한 호출처는 TabStackNavigator 한 곳뿐이다
    // (거기가 포커스된 라우트로 판단하는 단일 지점). 나머지는 0.
    const calls = out
      .split('\n')
      .filter((l: string) => l.trim() && !/:\s*\*/.test(l))
      .filter((l: string) => !l.includes('TabStackNavigator.tsx'));
    expect(calls).toEqual([]);
  });

  it('탭 웹뷰는 hideCount 를 존중하는 setter 를 쓴다', () => {
    const webview = read('src/screens/tabs/TabWebView.tsx');
    expect(webview).toContain('setTabBarVisibleFromUrl');
  });
});

describe('★clip 패딩은 내비게이터와 같은 조건이어야 한다', () => {
  it('내비게이터는 display:none && tabBarClipWhenHidden 일 때만 자른다', () => {
    expect(navigator).toContain("display === 'none'");
    expect(navigator).toContain('tabBarClipWhenHidden');
  });

  it('★패딩은 tabBarVisible 하나만 본다 — 내비게이터와 같은 신호', () => {
    // 내비게이터는 tabBarStyle.display 로 자르고, 그 값은 useTabBarVisibility
    // 가 정한다. 패딩도 같은 신호를 봐야 같은 프레임에 맞는다.
    //
    // 예전엔 hideCount 도 함께 봤는데, 라우트 기반 전환 후 네이티브 상세가
    // useHideTabBar 를 안 쓰게 되어 hideCount 가 늘 0 → 패딩이 영영 0 이었다.
    const fn = hook.slice(
      hook.indexOf('export function useHiddenTabBarClipPadding'),
      hook.indexOf('export function useHiddenTabBarClipPadding') + 700,
    );
    expect(fn).toContain('useTabBarVisibility()');
    // 주석엔 경위 설명으로 등장하므로 실제 코드 줄만 검사한다.
    const code = fn
      .split('\n')
      .filter((l: string) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join('\n');
    expect(code).not.toContain('hideCount');
    expect(code).not.toContain('useSyncExternalStore');
  });

  it('★★네이티브 화면은 상쇄 패딩을 쓰지 않는다', () => {
    // 내비게이터가 marginBottom: -clipPx 로 화면을 당기고, 화면이
    // paddingBottom: clipPx 로 되미는 구조였다. 두 값이 서로 다른 경로로
    // 오기 때문에(전역 store vs 네비 options) 한 프레임 어긋나면
    // 그 사이 여백이 보인다 — "생겼다 사라지는" 정체.
    //
    // 네이티브 화면의 하단 UI(BottomCTA·댓글 입력)는 자체적으로
    // insets.bottom 을 처리하므로 상쇄 패딩이 애초에 불필요하다.
    for (const f of [
      'src/screens/detail/ProductDetailScreen.tsx',
      'src/screens/comment/ProductCommentsScreen.tsx',
    ]) {
      expect(read(f)).not.toContain('useHiddenTabBarClipPadding');
    }
    // 하단 UI 가 여백을 직접 계산한다(그래서 상쇄 패딩이 필요 없다).
    // 상세에선 탭바도 보이므로 탭바 높이까지 포함한다.
    expect(read('src/screens/detail/ui/BottomCTA.tsx')).toContain(
      'getReservedBottomPx(insets.bottom)',
    );
  });

  it('★탭바가 보일 때도 하단 여백을 준다', () => {
    // 숨길 때만 패딩을 주면, 탭바가 보이는 경우 웹 콘텐츠가 홈 인디케이터에
    // 붙는다(폴백 상세 웹뷰에서 실제로 그랬다).
    const webviewDetail = read(
      'src/screens/detail/ProductDetailWebViewScreen.tsx',
    );
    expect(webviewDetail).toContain('getReservedBottomPx');
    expect(webviewDetail).toContain(
      'hideTabBar ? tabBarClipPad : reservedBottom',
    );
  });

  it('양쪽이 같은 getTabBarClipPx 를 쓴다', () => {
    expect(navigator).toContain('getTabBarClipPx');
    expect(hook).toContain('getTabBarClipPx');
  });
});

export {};
