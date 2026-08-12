import {createNavigationContainerRef} from '@react-navigation/native';

import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {
  getPushablePath,
  getTabNameFromUrl,
} from '@/shared/lib/navigation/tab-routing';

export const navigationRef = createNavigationContainerRef();

/**
 * 푸시 알림 URL 을 네이티브 상세로 보낸다.
 *
 * ⚠️ 왜 필요한가: FCM 은 지금까지 웹뷰에 location.href 를 주입하는 방식이었다.
 * 그 이동은 TabWebView 의 URL 필터를 다시 타는데, 필터에
 *   isUserInitiated = Platform.OS !== 'ios' || navigationType === 'click'
 * 라는 게이트가 있다. 주입된 이동은 iOS 에서 'click' 이 아니라서 상세 push 가
 * 걸리지 않고 탭 웹뷰가 그냥 이동해 버린다 → 푸시로 들어온 iOS 유저는
 * 네이티브 상세를 영영 못 본다. 푸시가 주 유입 경로라 그냥 두면 이번 작업이
 * 대부분의 유저에게 안 보인다.
 *
 * @returns 네이티브가 처리했으면 true. false 면 호출부가 기존 웹뷰 주입을 그대로 한다.
 */
export function navigateToProductDetail(url: string): boolean {
  if (!navigationRef.isReady()) return false;

  const path = getPushablePath(url);
  if (!path) return false;

  try {
    // 상세는 탭 안쪽 스택에 쌓인다. 어느 탭에 붙일지는 URL 로 정한다
    // (웹뷰 경로와 같은 규칙이라 뒤로가기 동선이 유지된다).
    const tabName = getTabNameFromUrl(url);
    (navigationRef.navigate as (name: string, params?: object) => void)(
      tabName,
      {screen: tabStackNavigations.DETAIL, params: {path}},
    );
    return true;
  } catch {
    // 네비게이션 상태가 예상과 다르면 조용히 실패시키고 웹뷰 경로로 넘긴다.
    return false;
  }
}

export {tabNavigations};
