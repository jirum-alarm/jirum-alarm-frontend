import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

// 탭바·상세 하단 CTA(둘 다 ~90px) 위로 띄운다. 66 이면 토스트가 버튼 윗부분을 덮고,
// 토스트가 떠 있는 동안 그 자리 터치를 가져가서 "눌렀는데 반응이 없는" 구간이 생겼다.
const TOAST_BOTTOM_OFFSET = 110;
// 라이브러리 기본 4초는 길다 — 그동안 하단 터치를 가린다. 되돌리기가 있으면 누를 시간을 준다.
const VISIBILITY_MS = 2500;
const VISIBILITY_WITH_ACTION_MS = 4000;

export type ToastAction = {label: string; onPress: () => void};

/**
 * 토스트 — 성공·실패를 **모양과 진동으로** 구분한다. 예전엔 전부 같은 회색 말풍선(info)이라
 * "등록했어요" 와 "실패했어요" 가 똑같이 보였다.
 * - success: 체크 + 가벼운 성공 진동. `action` 을 주면 오른쪽에 버튼(예: 되돌리기).
 * - error: 느낌표 + 실패 진동.
 * - info: 아이콘·진동 없음(안내 — "로그인 후 이용해주세요").
 */
function show(
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  action?: ToastAction,
) {
  Toast.show({
    type,
    text1: message,
    props: action ? {action} : undefined,
    position: 'bottom',
    bottomOffset: TOAST_BOTTOM_OFFSET,
    visibilityTime: action ? VISIBILITY_WITH_ACTION_MS : VISIBILITY_MS,
  });
  if (type === 'success') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
  } else if (type === 'error') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => {},
    );
  }
}

export const showToast = {
  success: (message: string, action?: ToastAction) =>
    show('success', message, action),
  info: (message: string) => show('info', message),
  warning: (message: string) => show('warning', message),
  error: (message: string) => show('error', message),
};
