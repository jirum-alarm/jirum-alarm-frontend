import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

const isHydratedAtom = atom(false);

export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useAtom(isHydratedAtom);

  useEffect(() => {
    setIsHydrated(true);
  }, [setIsHydrated]);

  return isHydrated;
};
