import { PAGE } from '@/constants/page';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

const useGoBack = (backTo: PAGE = PAGE.HOME) => {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(backTo);
    }
  }, [router, backTo]);
  return goBack;
};

export default useGoBack;
