'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

const scrollDirectionAtom = atom<ScrollDirection>(null);

export function useScrollDirection() {
  const isInitialMount = useRef(true);

  const [scrollDirection, setScrollDirection] = useAtom(scrollDirectionAtom);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      if (!ticking) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollDirection, setScrollDirection]);

  return scrollDirection;
}

export function useHeaderVisibility() {
  const scrollDirection = useScrollDirection();
  return scrollDirection ? scrollDirection === 'up' : true;
}
