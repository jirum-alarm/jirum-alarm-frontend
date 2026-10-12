import {areNativeTabsMounted, navigateToNativeRoute} from './navigation-ref';
import {Analytics} from '@/shared/lib/analytics/ga4';

// 탭이 뜨는지 이 간격으로 본다. 뜨는 즉시 열리도록 짧게 둔다.
const RETRY_INTERVAL_MS = 300;
// 이만큼 기다려도 탭이 안 뜨면(로그인 화면에 머묾 등) 웹뷰 경로로 넘기고 기록을 남긴다.
const GIVE_UP_AFTER_MS = 10_000;
const MAX_RETRIES = Math.ceil(GIVE_UP_AFTER_MS / RETRY_INTERVAL_MS);

/**
 * 푸시·딥링크 URL 을 **탭 네비게이터가 뜨는 즉시** 연다. 둘이 같은 루프를 쓴다.
 *
 * - 바로 한 번 시도하고, 아직 준비가 안 됐으면 300ms 마다 다시 본다.
 * - 탭이 떴는데도 네이티브가 못 가져가면(네이티브 화면이 없는 URL) 기다리지 않고 웹뷰로 넘긴다.
 *   "아직 준비 안 됨"과 "네이티브 화면 없음"은 둘 다 false 라 areNativeTabsMounted 로 가른다.
 *
 * ★예전 푸시 콜드 스타트는 첫 시도가 **무조건 1초 뒤**였고(1000 + n×500ms), 실행 중 탭은
 * 한 번만 시도해 부팅 창에 걸리면 그대로 흘렸다. 안드로이드는 콜드 스타트 한 번 탭에
 * expo 응답 리스너가 먼저 올 수 있는데, 그 단발 시도가 실패하면 중복 판정 때문에
 * getInitialNotification 경로까지 버려져 링크가 사라질 수 있었다.
 */
export function openWhenNavigatorReady(
  url: string,
  openInWebView: (url: string) => void,
  options: {source: 'push' | 'deeplink'; isCancelled?: () => boolean},
): void {
  const attempt = (retry: number) => {
    if (options.isCancelled?.()) return;
    if (navigateToNativeRoute(url, {allowWebViewRoute: true})) return;
    if (areNativeTabsMounted()) {
      openInWebView(url);
      return;
    }
    if (retry >= MAX_RETRIES) {
      // 끝내 탭이 안 떴다 — 열지 못한 링크가 얼마나 되는지 보이게 남긴다.
      Analytics.track('route_open_timeout', {
        url,
        source: options.source,
        platform: 'app',
      });
      openInWebView(url);
      return;
    }
    setTimeout(() => attempt(retry + 1), RETRY_INTERVAL_MS);
  };
  attempt(0);
}
