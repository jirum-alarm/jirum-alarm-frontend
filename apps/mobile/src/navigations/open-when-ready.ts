import {areNativeTabsMounted, navigateToNativeRoute} from './navigation-ref';
import {Analytics} from '@/shared/lib/analytics/ga4';

// 탭이 뜨는지 이 간격으로 본다. 뜨는 즉시 열리도록 짧게 둔다.
const RETRY_INTERVAL_MS = 300;
// 이만큼 기다려도 탭이 안 뜨면(로그인 화면에 머묾 등) 웹뷰 경로로 넘기고 기록을 남긴다.
const GIVE_UP_AFTER_MS = 10_000;
const MAX_RETRIES = Math.ceil(GIVE_UP_AFTER_MS / RETRY_INTERVAL_MS);
// 로그인하는 데 이보다 오래 걸렸으면 그 링크는 이미 지난 일로 본다(알림 딜은 몇 시간이면 식는다).
const PENDING_TTL_MS = 30 * 60 * 1000;

type Source = 'push' | 'deeplink';
let pending: {
  url: string;
  openInWebView: (url: string) => void;
  source: Source;
  at: number;
} | null = null;

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
  options: {source: Source; isCancelled?: () => boolean},
): void {
  const attempt = (retry: number) => {
    if (options.isCancelled?.()) return;
    if (navigateToNativeRoute(url, {allowWebViewRoute: true})) return;
    if (areNativeTabsMounted()) {
      openInWebView(url);
      return;
    }
    if (retry >= MAX_RETRIES) {
      // 끝내 탭이 안 떴다 = 로그인 화면에 있다(세션이 끝난 사람). 웹뷰도 없어서 예전엔 주입한 링크가
      // 그대로 사라졌다 — 로그인(또는 둘러보기)으로 메인이 뜨면 그때 연다(flushPendingRoute).
      Analytics.track('route_open_timeout', {
        url,
        source: options.source,
        platform: 'app',
      });
      pending = {url, openInWebView, source: options.source, at: Date.now()};
      return;
    }
    setTimeout(() => attempt(retry + 1), RETRY_INTERVAL_MS);
  };
  attempt(0);
}

/**
 * 로그인 화면 때문에 못 연 링크를 연다 — MainNavigator 가 마운트될 때(로그인·둘러보기로 메인 진입) 부른다.
 * 로그인 화면 안에서 화면이 바뀔 때마다 부르면 기다림 루프가 다시 돌아 타임아웃이 거듭 찍히므로 이 한 곳만.
 */
export function flushPendingRoute(now = Date.now()): void {
  const p = pending;
  pending = null;
  if (!p || now - p.at > PENDING_TTL_MS) return;
  Analytics.track('route_open_after_login', {
    url: p.url,
    source: p.source,
    platform: 'app',
  });
  openWhenNavigatorReady(p.url, p.openInWebView, {source: p.source});
}
