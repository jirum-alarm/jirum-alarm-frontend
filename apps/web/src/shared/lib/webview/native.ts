import { WebViewBridge } from './sender';
import { type HapticStyle, WebViewEventType } from './type';

function isInApp(): boolean {
  return !!window.ReactNativeWebView;
}

/**
 * 네이티브 햅틱 피드백을 트리거합니다.
 * 앱 환경이 아니면 아무 동작 안 함.
 */
export function triggerHaptic(style: HapticStyle = 'light') {
  if (!isInApp()) return;
  WebViewBridge.sendMessage(WebViewEventType.HAPTIC_FEEDBACK, {
    data: { style },
  });
}

/**
 * 네이티브 공유 시트를 엽니다.
 * 앱 환경이면 네이티브 공유, 아니면 Web Share API 폴백.
 * 둘 다 불가능하면 에러를 throw합니다.
 */
export async function shareNative(params: { title: string; url: string; message?: string }) {
  if (isInApp()) {
    WebViewBridge.sendMessage(WebViewEventType.SHARE_REQUEST, {
      data: params,
    });
    return;
  }

  // 웹 폴백
  if (navigator.share) {
    await navigator.share({ title: params.title, url: params.url });
    return;
  }

  throw new Error('Share not supported');
}
