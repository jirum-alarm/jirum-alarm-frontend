import Toast from 'react-native-toast-message';

/**
 * Display toast messages to the user
 *
 * @example
 * showToast.info('Successfully saved');
 * showToast.error('Failed to save');
 */
export const showToast = {
  info: (message: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      position: 'bottom',
      bottomOffset: 66,
    });
  },
  warning: (message: string) => {
    Toast.show({
      type: 'warning',
      text1: message,
      position: 'bottom',
      bottomOffset: 66,
    });
  },
  error: (message: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      position: 'bottom',
      bottomOffset: 66,
    });
  },
};
