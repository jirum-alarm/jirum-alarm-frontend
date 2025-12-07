'use client';

import { useAtom } from 'jotai';
import { useEffect } from 'react';

import { isHydratedAtom } from '@/shared/model/hydration';

export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useAtom(isHydratedAtom);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHydrated(true);
    }
  }, [setIsHydrated]);

  return isHydrated;
};
