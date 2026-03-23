import Toast from 'react-native-toast-message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const bottomTabsHeight = 56;
const offset = 10;

const useToast = () => {
  const insets = useSafeAreaInsets();
  console.log(insets.bottom + 10);
  const showToast = {
    info: (message: string) => {
      Toast.show({
        type: 'info',
        text1: message,
        position: 'bottom',
        bottomOffset: insets.bottom + bottomTabsHeight + offset,
      });
    },
    warning: (message: string) => {
      Toast.show({
        type: 'warning',
        text1: message,
        position: 'bottom',
        bottomOffset: insets.bottom + bottomTabsHeight + offset,
      });
    },
    error: (message: string) => {
      Toast.show({
        type: 'error',
        text1: message,
        position: 'bottom',
        bottomOffset: insets.bottom + bottomTabsHeight + offset,
      });
    },
  };
  return {showToast};
};

export default useToast;
