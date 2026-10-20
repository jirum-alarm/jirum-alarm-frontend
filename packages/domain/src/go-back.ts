/**
 * 웹 화면의 「뒤로」가 어디로 가나 — web useGoBack 의 판정. 앱이 웹뷰에 심는 신호(dataset.nativeStack)와 짝이다.
 *
 *   1. 앱 네이티브 스택 위 웹뷰(dataset.nativeStack === 'true' 이고 앱 안) → 네이티브가 pop(PRESS_BACKBUTTON 브릿지)
 *   2. 우리 사이트에서 왔거나 history 가 쌓여 있으면 → router.back()
 *   3. 둘 다 아니면 → 대체 주소로 push(기본 홈)
 *
 * 앱 탭 스택에 새로 push 된 웹뷰는 history 가 비어 3번으로 떨어져, 뒤로를 눌러도 웹뷰 안에 홈이 그려졌다 —
 * 그래서 앱은 로드 전에 1번 신호를 심는다(native-stack-script). 전엔 앱 테스트가 web 훅 소스를 읽고 판정을
 * 복사해 재현했다; 이제 web 훅이 이 함수를 쓰고 앱 테스트도 이 함수를 본다(2026-10-20).
 */

/** 앱이 웹뷰 document.documentElement.dataset 에 심는 키(값 'true'). */
export const NATIVE_STACK_DATASET_KEY = 'nativeStack';

export type GoBackAction = 'native-pop' | 'router-back' | 'push-fallback';

export function decideGoBack({
  nativeStack,
  isInApp,
  referrer,
  historyLength,
}: {
  nativeStack?: string;
  isInApp: boolean;
  referrer: string;
  historyLength: number;
}): GoBackAction {
  if (nativeStack === 'true' && isInApp) return 'native-pop';
  if ((referrer && referrer.indexOf('jirum-alarm.com') !== -1) || historyLength > 1) {
    return 'router-back';
  }
  return 'push-fallback';
}
