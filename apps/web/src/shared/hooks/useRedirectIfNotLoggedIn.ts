import { PAGE } from '@/constants/page';
import useMyRouter from '@/hooks/useMyRouter';

import { WindowLocation } from '../lib/window-location';

import useIsLoggedIn from './useIsLoggedIn';

const useRedirectIfNotLoggedIn = () => {
  const router = useMyRouter();
  const { isLoggedIn } = useIsLoggedIn();

  const checkAndRedirect = () => {
    if (!isLoggedIn) {
      router.push(PAGE.LOGIN + '?rtnUrl=' + encodeURIComponent(WindowLocation.getCurrentUrl()));
      return true;
    }
    return false;
  };
  return { checkAndRedirect };
};

export default useRedirectIfNotLoggedIn;
