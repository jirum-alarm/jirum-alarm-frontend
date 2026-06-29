'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  const measure = useCallback(() => {
    const element = ref.current;
    if (!element) return 0;

    const nextWidth = element.getBoundingClientRect().width;
    setWidth((prevWidth) => (prevWidth === nextWidth ? prevWidth : nextWidth));
    return nextWidth;
  }, []);

  const setRef = useCallback(
    (element: T | null) => {
      ref.current = element;
      if (element) measure();
    },
    [measure],
  );

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, [measure]);

  return { ref: setRef, width };
}
