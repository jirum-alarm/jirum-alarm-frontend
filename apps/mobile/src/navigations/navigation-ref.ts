import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {
  resolveNativeRoute,
  type NativeRoute,
} from '@/shared/lib/navigation/tab-routing';
import {requestTrendingView} from '@/screens/trending/trending-view-store';

export const navigationRef = createNavigationContainerRef();

/**
 * 푸시·딥링크 URL 을 네이티브 화면으로 보낸다.
 *
 * ⚠️ 왜 필요한가: FCM 은 원래 웹뷰에 `location.href` 를 주입하는 방식이었다.
 * 그 이동은 TabWebView 의 URL 필터를 다시 타는데, 필터에
 *   isUserInitiated = Platform.OS !== 'ios' || navigationType === 'click'
 * 게이트가 있어 주입된 이동은 iOS 에서 상세 push 가 걸리지 않는다. 게다가 홈·발견·
 * 알림 탭은 이제 웹뷰 ref 자체가 없어서 주입이 **조용히 no-op** 이 된다
 * (옵셔널 체이닝이 삼킨다 → 알림을 눌렀는데 아무 일도 안 일어난다).
 *
 * 어느 URL 이 어느 화면인지는 `resolveNativeRoute` 한 곳에서만 판정한다.
 *
 * @returns 네이티브가 처리했으면 true. false 면 호출부가 기존 웹뷰 주입을 한다.
 */
export function navigateToNativeRoute(
  url: string,
  options?: {allowWebViewRoute?: boolean},
): boolean {
  if (!navigationRef.isReady()) return false;

  const route = resolveNativeRoute(url, options);
  if (!route) return false;

  return navigateToRoute(route);
}

/**
 * 발견 탭(`/trending/*`) 전용 입구. 웹뷰 안 링크 클릭이 쓴다
 * (TabWebView 의 URL 필터·SPA 폴백).
 *
 * ⚠️ 발견 탭이 네이티브가 된 뒤엔 그 탭에 웹뷰 ref 가 없다. 그대로 두면 호출부가
 * `webviewRef`(지금 활성 탭의 웹뷰)로 폴백해서 **엉뚱한 탭 안에** trending
 * 페이지를 띄운다 — 탭 아이콘은 홈인데 내용은 랭킹이 된다.
 *
 * @returns 네이티브가 처리했으면 true.
 */
export function navigateToTrending(url: string): boolean {
  if (!navigationRef.isReady()) return false;

  const route = resolveNativeRoute(url);
  if (!route?.trendingView) return false;

  return navigateToRoute(route);
}

type NavState = {
  routeNames?: string[];
  routes?: {state?: NavState}[];
};

/** 중첩 네비게이터까지 훑어 이 이름의 라우트가 있는지 본다. */
function containsRouteName(state: NavState, name: string): boolean {
  if (state.routeNames?.includes(name)) return true;
  return (state.routes ?? []).some(
    route => !!route.state && containsRouteName(route.state, name),
  );
}

/**
 * 지금 네비게이터가 이 탭을 받을 수 있나.
 *
 * 🔴 react-navigation 은 처리 못 하는 navigate 를 **던지지 않는다** — 콘솔에
 * "The action 'NAVIGATE' ... was not handled by any navigator" 만 찍고 조용히
 * 무시한다. 그래서 try/catch 로는 못 잡히고, 호출부는 "네이티브가 처리했다"는
 * true 를 받아 **웹뷰 폴백까지 건너뛴다** → 링크가 통째로 사라진다.
 *
 * 로그인 전에는 AuthNavigator 만 떠 있어 탭이 아예 없으므로 실제로 걸린다
 * (시뮬레이터 검증에서 이 에러로 발견했다).
 */
function canNavigateToTab(tab: string): boolean {
  const state = navigationRef.getRootState?.() as NavState | undefined;
  return !!state && containsRouteName(state, tab);
}

/**
 * 탭 네비게이터가 떴나 = 이제 판정 결과를 믿어도 되나.
 *
 * 호출부가 "아직 준비 안 됨"과 "네이티브 화면이 없음"을 구분하는 데 쓴다.
 * 둘 다 navigateToNativeRoute 가 false 를 주지만, 앞은 기다려야 하고
 * 뒤는 곧장 웹뷰로 넘겨야 한다(기다리면 그만큼 화면이 늦게 뜬다).
 */
export function areNativeTabsMounted(): boolean {
  return canNavigateToTab(tabNavigations.HOME);
}

function navigateToRoute(route: NativeRoute): boolean {
  if (!canNavigateToTab(route.tab)) return false;

  try {
    // ★발견 탭은 어느 view 를 보여줄지 **먼저** 넣는다. 화면 마운트보다 늦게
    // 넣으면 첫 렌더가 이전 view 로 한 번 나온 뒤 바뀌어 깜빡인다.
    if (route.trendingView) {
      requestTrendingView(route.trendingView);
    }

    if (!route.screen) {
      // 탭 루트로. 스택에 상세가 쌓여 있어도 ROOT 가 아래에 있으므로
      // navigate 가 거기까지 되돌린다.
      (navigationRef.navigate as (name: string, params?: object) => void)(
        route.tab,
        {screen: tabStackNavigations.ROOT},
      );
      return true;
    }

    // 🔴하위 화면은 **중첩 스택 상태를 직접 지정**한다.
    //
    // `navigate(tab, {screen})` 만 쓰면 아직 마운트되지 않은 탭의 스택이 그 화면
    // **하나로 초기화**되어 아래에 아무것도 없다 → **뒤로가기가 사라진다**
    // (iOS 26 실측: 푸시로 커뮤니티 글을 열면 목록으로 돌아갈 길이 없었다).
    // ROOT 를 먼저 navigate 하는 우회도 안 먹는다 — 마운트 전에는 두 번째
    // navigate 가 첫 번째를 덮어써 결국 한 칸만 남는다(실측: 스택이
    // ["CommunityPost"] 하나였다). 그래서 라우트 배열을 그대로 준다.
    navigationRef.dispatch(
      CommonActions.navigate({
        name: route.tab,
        params: {
          state: {
            index: 1,
            routes: [
              {name: tabStackNavigations.ROOT},
              {name: route.screen, params: route.params},
            ],
          },
        },
      }),
    );
    return true;
  } catch {
    // 네비게이션 상태가 예상과 다르면 조용히 실패시키고 웹뷰 경로로 넘긴다.
    return false;
  }
}

export {tabNavigations};
