import { useCallback } from 'react';

import { PAGE } from '@/shared/config/page';
import useMyRouter from '@/shared/hooks/useMyRouter';

const useGoBack = (backTo: PAGE = PAGE.HOME) => {
  const router = useMyRouter();

  const goBack = useCallback(() => {
    if (
      (document.referrer && document.referrer.indexOf('jirum-alarm.com') != -1) ||
      window.history.length > 1
    ) {
      router.back();
    } else {
      router.push(backTo);
    }
  }, [router, backTo]);

  return goBack;
};

export default useGoBack;
