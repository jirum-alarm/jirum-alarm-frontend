import Toast from 'react-native-toast-message';

/**
 * Display toast messages to the user
 *
 * @example
 * showToast.info('Successfully saved');
 * showToast.error('Failed to save');
 */
// 탭바·상세 하단 CTA(둘 다 ~90px) 위로 띄운다. 66 이면 토스트가 버튼 윗부분을 덮고,
// 토스트는 뜬 4초 동안 그 자리 터치를 가져가서 "눌렀는데 반응이 없는" 구간이 생겼다.
const TOAST_BOTTOM_OFFSET = 110;

export const showToast = {
  info: (message: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      position: 'bottom',
      bottomOffset: TOAST_BOTTOM_OFFSET,
    });
  },
  warning: (message: string) => {
    Toast.show({
      type: 'warning',
      text1: message,
      position: 'bottom',
      bottomOffset: TOAST_BOTTOM_OFFSET,
    });
  },
  error: (message: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      position: 'bottom',
      bottomOffset: TOAST_BOTTOM_OFFSET,
    });
  },
};
