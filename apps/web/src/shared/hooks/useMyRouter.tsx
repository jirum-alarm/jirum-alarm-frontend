'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type NavigateOptions = {
  scroll?: boolean;
};

export type MyRouter = {
  push: (href: string, options?: NavigateOptions) => void;
  replace: (href: string, options?: NavigateOptions) => void;
  back: () => void;
};

export default function useMyRouter(): MyRouter {
  const router = useRouter();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      router.push(href, options);
    },
    [router],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      router.replace(href, options);
    },
    [router],
  );

  const back = useCallback(() => {
    router.back();
  }, [router]);

  return useMemo(
    () => ({
      push,
      replace,
      back,
    }),
    [push, replace, back],
  );
}
