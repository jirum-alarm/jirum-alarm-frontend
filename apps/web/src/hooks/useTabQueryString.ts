import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import useMyRouter from '@/hooks/useMyRouter';

const useTabQueryString = (tab: string) => {
  const router = useMyRouter();
  const searchParams = useSearchParams();
  const [tabQuery, setTabQuery] = useState<string | null>(null);
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams],
  );

  const setTabChange = (value: string) => {
    setTabQuery(value);
    router.replace(`?${createQueryString(tab, value)}`, { scroll: false });
  };

  useEffect(() => {
    const _tab = searchParams.get(tab);
    if (!_tab) return;
    setTabQuery(_tab);
  }, [searchParams]);

  return { setTabChange, currentTab: tabQuery };
};

export default useTabQueryString;
