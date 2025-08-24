'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';

const isHydratedAtom = atom(false);

export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useAtom(isHydratedAtom);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsHydrated(true);
    }
  }, [setIsHydrated]);

  return isHydrated;
};
