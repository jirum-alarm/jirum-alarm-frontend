/**
 * 기능 스위치.
 *
 * OTA(expo-updates)가 배선돼 있어 이 값들은 `eas update` 로 되돌릴 수 있다
 * (스토어 빌드 1회 후 유효). 다만 런타임 원격 플래그가 아니라 번들에 박히는
 * 상수이므로, 되돌리려면 새 업데이트를 내보내야 한다.
 * ⚠️ runtimeVersion 이 바뀌는 네이티브 변경과 같이 나가면 OTA 로 안 넘어간다.
 */

/** 홈 탭을 네이티브 화면으로. false 면 기존 웹뷰(TabWebView)로 되돌아간다. */
export const NATIVE_HOME = true;

/** 발견 탭(실시간·랭킹)을 네이티브 화면으로. false 면 기존 웹뷰로 되돌아간다. */
export const NATIVE_DISCOVER = true;

/** 알림 탭을 네이티브 화면으로. false 면 기존 웹뷰(TabWebView)로 되돌아간다. */
export const NATIVE_ALARM = true;
