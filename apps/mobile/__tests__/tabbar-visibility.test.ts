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

describe('탭바를 숨기는 카운터는 없다', () => {
  it('useHideTabBar·hideCount 가 사라졌다 — 그런 화면은 루트 스택이 탭바째 덮는다', () => {
    // 화면마다 숨김 카운터를 올리고 내리면 (다음 focus)→(이전 cleanup) 순서·한 틱 지연에
    // 기대게 된다. 상세 등을 탭 바깥 루트 스택에 두면 숨길 일 자체가 없다(2026-10-01).
    expect(hook).not.toContain('hideCount');
    expect(hook).not.toContain('export function useHideTabBar');
  });
});

describe('★★탭 위에 쌓는 화면은 루트 스택이 탭바째 덮는다', () => {
  const tabStack = read('src/navigations/tab/TabStackNavigator.tsx');
  const rootStack = read('src/navigations/stack/MainNavigator.tsx');

  it('탭 스택엔 탭 루트 하나뿐이다', () => {
    // 탭 안 스택에 상세를 쌓으면 탭바가 위에 남아 숨기고 되살려야 했고, 그 타이밍
    // (전환 시작·끝·스와이프 취소)이 늘 어긋나 "뒤늦게 생긴다·깜빡인다"(2026-10-01 사용자).
    const routes = [...tabStack.matchAll(/tabStackNavigations\.(\w+)/g)].map(
      m => m[1],
    );
    expect(new Set(routes)).toEqual(new Set(['ROOT']));
  });

  it('쌓는 화면은 전부 루트 스택에 있다', () => {
    for (const name of [
      'DETAIL',
      'COMMENTS',
      'SEARCH',
      'CURATION',
      'TOSS_CURATION',
      'WEBVIEW',
      'MYPAGE_ACCOUNT',
      'MYPAGE_KEYWORD',
      'MYPAGE_NOTIFICATION',
      'LIKE',
      'THEMES',
      'THEME_DETAIL',
      'POLICY',
      'COMMUNITY_POST',
      'COMMUNITY_WRITE',
    ]) {
      expect(rootStack).toContain(`name={tabStackNavigations.${name}}`);
    }
    // 첫 화면이 탭 전체다.
    expect(rootStack).toMatch(
      /name=\{mainNavigations\.TABS\}\s*component=\{MainTabNavigator\}/,
    );
  });

  it('라우트로 탭바를 숨기고 되살리는 장치가 없다 — 되살아나면 시간차·깜빡임이 재발한다', () => {
    for (const marker of [
      'hidesTabBar',
      'transitionStart',
      'transitionEnd',
      'gestureCancel',
    ]) {
      expect(tabStack).not.toContain(marker);
    }
    const visibility = read('src/shared/hooks/useTabBarVisibility.ts');
    expect(visibility).not.toContain('setTimeout');
    jest.isolateModules(() => {
      const vis = require('../src/shared/hooks/useTabBarVisibility');
      vis.setTabBarVisible(false);
      expect(vis.getVisible()).toBe(false);
      vis.setTabBarVisible(true);
      expect(vis.getVisible()).toBe(true);
    });
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
    // 정당한 호출처는 TabStackNavigator 한 곳뿐이다(탭을 옮기면 되살리는 지점). 나머지는 0.
    const calls = out
      .split('\n')
      .filter((l: string) => l.trim() && !/:\s*\*/.test(l))
      .filter((l: string) => !l.includes('TabStackNavigator.tsx'));
    expect(calls).toEqual([]);
  });

  it('탭 웹뷰는 전용 setter 를 쓴다(URL 판단 한 곳)', () => {
    const webview = read('src/screens/tabs/TabWebView.tsx');
    expect(webview).toContain('setTabBarVisibleFromUrl');
  });
});

describe('★clip 패딩은 내비게이터와 같은 조건이어야 한다', () => {
  it('내비게이터는 display:none && tabBarClipWhenHidden 일 때만 자른다', () => {
    expect(navigator).toContain("display === 'none'");
    expect(navigator).toContain('tabBarClipWhenHidden');
  });

  it('★패딩은 내비게이터와 같은 조건 — clip 을 켜는 곳이 없으니 0', () => {
    // 내비게이터는 display:none && tabBarClipWhenHidden 일 때만 자르는데, 탭 스택이 clip 을 끄고
    // 쌓는 화면은 루트 스택이라 자르는 일이 없다. 패딩만 생기면 CTA 가 98px 아래로 밀린다(지적 이력).
    const tabStack = read('src/navigations/tab/TabStackNavigator.tsx');
    expect(tabStack).toMatch(/tabBarClipWhenHidden:\s*false/);
    const fn = hook.slice(
      hook.indexOf('export function useHiddenTabBarClipPadding'),
    );
    expect(fn).toMatch(/\{\s*return 0;\s*\}/);
  });

  it('★★상세는 탭바가 없으므로 CTA 가 safe area + clip 상쇄만 비운다', () => {
    // 2026-10-01 지시로 상세엔 탭바가 없다(루트 스택이 덮는다). 탭바 높이(getReservedBottomPx)를
    // 계속 비우면 CTA 아래에 빈 띠가 남는다.
    const cta = read('src/screens/detail/ui/BottomCTA.tsx');
    expect(cta).toContain('useHiddenTabBarClipPadding');
    expect(cta).toContain('Math.max(insets.bottom, 12) + bottomClip');
    expect(cta).not.toContain('getReservedBottomPx');
  });

  it('★★탭바를 숨기는 화면의 하단 고정 UI 는 반드시 상쇄한다', () => {
    // 🔴예전 이 테스트는 상쇄 패딩을 **금지**했다. 그 근거("하단 UI 는
    // insets.bottom 만으로 충분하다")가 iOS 26 실측에서 틀렸다:
    // 탭바를 숨기는 유일한 수단이 화면째로 clipPx 내려서 잘라내기라
    // (`BottomTabs` 에 숨기는 prop 이 없다) 바닥에 붙은 입력창이 잘린
    // 영역으로 들어가 통째로 사라졌다(사용자 지적 2회: "댓글 입력하는게
    // 사라지네" → clip 을 끄니 "바텀 네비랑 겹쳐있어").
    //
    // 깜빡임 우려는 훅이 hideCount(항상 0)를 보던 시절의 것이고, 지금은
    // 내비게이터와 **같은 신호**(tabBarVisible)를 본다 — 위 테스트가 고정.
    for (const f of [
      'src/screens/comment/ProductCommentsScreen.tsx',
      'src/screens/community/CommunityPostScreen.tsx',
    ]) {
      const src = read(f);
      expect(src).toContain('useHiddenTabBarClipPadding');
      expect(src).toContain('Math.max(insets.bottom, 4) + bottomClip');
    }
  });

  it('★★상세 두 갈래가 같은 하단 정책을 쓴다', () => {
    // /products/123 은 네이티브, 하위 경로는 웹뷰 폴백이 맡는다 — 둘 다 루트 스택이라 탭바가 없다.
    // 진입 경로에 따라 하단이 달라지면 안 된다(사용자 지적: "웹뷰에서 갔을 때랑 홈에서 갔을 때가 다르다").
    const fallback = read('src/screens/detail/ProductDetailWebViewScreen.tsx');
    expect(fallback).not.toMatch(/\bhideTabBar\b/);
    // 웹 자체 하단바는 항상 숨긴다 — 상세엔 찜·구매 CTA 만 남는다.
    expect(fallback).toMatch(/hideWebNav\s*\n/);
  });

  it('★상세 웹뷰는 탭바 높이를 비우지 않는다 — 탭바째 덮이므로', () => {
    // 탭바 높이(getReservedBottomPx)를 비우면 콘텐츠 아래 빈 띠가 남는다. clip 상쇄(탭바가 보이는
    // 루트 스택에선 0)만 둔다 — clip 시절과 같은 최종 배치(콘텐츠가 기기 바닥까지)다.
    const webviewDetail = read(
      'src/screens/detail/ProductDetailWebViewScreen.tsx',
    );
    expect(webviewDetail).not.toContain('getReservedBottomPx');
    expect(webviewDetail).toContain('{paddingBottom: tabBarClipPad}');
  });

  it('양쪽이 같은 getTabBarClipPx 를 쓴다', () => {
    expect(navigator).toContain('getTabBarClipPx');
    expect(hook).toContain('getTabBarClipPx');
  });
});

describe('★★탭바를 숨기는 수단이 clip 하나뿐임을 못 박는다', () => {
  it('BottomTabs 에 숨기는 prop 이 없어 clip 이 곧 숨김이다', () => {
    // display:'none' 은 이 래퍼가 해석하는 우리 규약일 뿐이고, 실제 동작은
    // marginBottom: -clipPx + 바깥 overflow:hidden 이다. 그래서 clip 을 끄면
    // **탭바가 그대로 보인다** — 한 번 그렇게 고쳤다가 사용자가 잡았다.
    expect(navigator).toContain("overflow: 'hidden'");
    expect(navigator).toContain('marginBottom: -clipPx');
    expect(navigator).not.toContain('tabBarHidden');
  });
});

describe('★네이티브 FAB 은 safe-area 를 포함한 여백을 쓴다', () => {
  it('커뮤니티 글쓰기 버튼은 getFabPaddingPx 를 쓰지 않는다', () => {
    // getFabPaddingPx 는 **웹뷰 주입용**이라 iOS 26 에서 safe-area 를 일부러
    // 뺀다(web 이 자기 1rem 을 더한다). 네이티브의 bottom:0 은 홈 인디케이터
    // 아래라 그 값을 쓰면 글래스 탭바와 겹친다(사용자 지적).
    const community = read('src/screens/community/CommunityScreen.tsx');
    const code = community
      .split('\n')
      .filter((l: string) => !/^\s*(\/\/|\*|\/\*)/.test(l))
      .join('\n');
    expect(code).not.toContain('getFabPaddingPx');
    expect(code).toContain('reservedBottom + GLASS_BOTTOM_GAP');
  });
});

export {};
