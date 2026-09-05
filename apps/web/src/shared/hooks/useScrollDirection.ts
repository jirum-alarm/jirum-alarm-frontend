'use client';

import { atom, useAtom } from 'jotai';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

const scrollDirectionAtom = atom<ScrollDirection>(null);

export function useScrollDirection() {
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const scrollDirectionRef = useRef<ScrollDirection>(null);

  const [scrollDirection, setScrollDirection] = useAtom(scrollDirectionAtom);
  const pathname = usePathname();

  scrollDirectionRef.current = scrollDirection;

  useEffect(() => {
    setScrollDirection('up');
    // 0 이 아니라 실제 스크롤 위치로 맞춘다 — 뒤로가기는 브라우저가 스크롤을
    // 복원해서 돌아오는데, 0 으로 가정하면 첫 스크롤 이벤트에서 복원값(예: 2000)과
    // 비교해 'down' 으로 오판정하고 헤더·바텀네비가 숨었다 나타나며 흔들린다.
    lastScrollY.current = typeof window === 'undefined' ? 0 : window.scrollY;
  }, [pathname, setScrollDirection]);

  useEffect(() => {
    const THRESHOLD = 10;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
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
        if (direction !== scrollDirectionRef.current) {
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
  }, [setScrollDirection]);

  return scrollDirection;
}

export function useHeaderVisibility() {
  const scrollDirection = useScrollDirection();
  return scrollDirection ? scrollDirection === 'up' : true;
}
