import { useRouter } from 'next/navigation';
import useIsLoggedIn from './useIsLoggedIn';
import { PAGE } from '@/constants/page';

const useRedirectIfNotLoggedIn = () => {
  const router = useRouter();
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
