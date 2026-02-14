'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

const scrollDirectionAtom = atom<ScrollDirection>(null);

export function useScrollDirection() {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const [scrollDirection, setScrollDirection] = useAtom(scrollDirectionAtom);

  useEffect(() => {
    const THRESHOLD = 10;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      if (Math.abs(scrollY - lastScrollY.current) < THRESHOLD) {
        ticking.current = false;
        return;
      }

      // Always show when near top or bottom
      if (scrollY < THRESHOLD || scrollY + clientHeight >= scrollHeight - THRESHOLD) {
        setScrollDirection('up');
      } else {
        const direction = scrollY > lastScrollY.current ? 'down' : 'up';
        if (direction !== scrollDirection) {
          setScrollDirection(direction);
        }
      }

      lastScrollY.current = scrollY > 0 ? scrollY : 0;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

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
