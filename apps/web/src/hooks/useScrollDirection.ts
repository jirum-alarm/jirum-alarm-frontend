'use client';

import { Atom, atom, useAtom } from 'jotai';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface ScrollDirectionAtom {
  [key: string]: ScrollDirection;
}

const scrollDirectionAtom = atom<ScrollDirectionAtom>({});

export function useScrollDirection(key: string) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  const [scrollDirection, setScrollDirection] = useAtom<ScrollDirectionAtom>(scrollDirectionAtom);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      console.log('direction', direction);
      if (
        direction !== scrollDirection.value &&
        (scrollY - lastScrollY > 10 || scrollY - lastScrollY < -10)
      ) {
        setScrollDirection({ ...scrollDirection, [key]: direction });
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        if (prevPathname.current !== pathname) {
          prevPathname.current = pathname;
          return;
        }
        window.requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [scrollDirection, setScrollDirection, pathname, key]);

  return scrollDirection[key];
}

export function useHeaderVisibility() {
  const scrollDirection = useScrollDirection('header');
  console.log(scrollDirection);
  return scrollDirection ? scrollDirection === 'up' : true;
}
