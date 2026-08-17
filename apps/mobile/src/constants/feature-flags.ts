/**
 * 빌드 시점 기능 스위치.
 *
 * ⚠️ OTA 가 없다(mobile-no-ota-store-review-required) — 원격 킬스위치가 아니라
 * 빌드 스위치다. 되돌리려면 값만 바꿔 다시 빌드·심사해야 하므로,
 * 새 화면은 단계별로 나눠 내보낸다.
 */

/** 홈 탭을 네이티브 화면으로. false 면 기존 웹뷰(TabWebView)로 되돌아간다. */
export const NATIVE_HOME = true;
