import useIsLoggedIn from './useIsLoggedIn';
import { PAGE } from '@/constants/page';
import useMyRouter from '@/hooks/useMyRouter';

const useRedirectIfNotLoggedIn = () => {
  const router = useMyRouter();
  const isLoggedIn = useIsLoggedIn();

  const checkAndRedirect = () => {
    if (!isLoggedIn) {
      router.push(PAGE.LOGIN);
      return true;
    }
    return false;
  };
  return { checkAndRedirect };
};

export default useRedirectIfNotLoggedIn;
