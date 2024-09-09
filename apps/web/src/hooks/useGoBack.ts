import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { PAGE } from '@/constants/page';

const useGoBack = (backTo: PAGE = PAGE.HOME) => {
  const router = useRouter();
  const goBack = useCallback(() => {
    (document.referrer && document.referrer.indexOf('jirum-alarm.com') != -1) ||
    window.history.length > 1
      ? router.back()
      : router.push(backTo);
  }, [router, backTo]);
  return goBack;
};

export default useGoBack;
