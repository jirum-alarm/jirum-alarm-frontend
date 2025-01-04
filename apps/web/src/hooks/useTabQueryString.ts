import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

const useTabQueryString = (tab: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const setTabChange = (value: string) => {
    router.replace(`?${createQueryString(tab, value)}`, { scroll: false });
  };

  return { setTabChange, currentTab: searchParams.get(tab) };
};

export default useTabQueryString;
