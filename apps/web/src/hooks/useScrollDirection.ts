'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useRef } from 'react';

type ScrollDirection = 'up' | 'down' | null;

const scrollDirectionAtom = atom<ScrollDirection>(null);

export function useScrollDirection() {
  const isInitialMount = useRef(true);
  const scrollStartY = useRef(0);
  const scrollEndTimeout = useRef<NodeJS.Timeout | null>(null);
  const ticking = useRef(false);

  const [scrollDirection, setScrollDirection] = useAtom(scrollDirectionAtom);

  useEffect(() => {
    const SCROLL_END_DELAY = 100; // 스크롤 종료로 판단하는 시간 (ms)
    const MIN_SCROLL_DISTANCE = 10; // 최소 스크롤 거리 (px)

    const onScroll = () => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        scrollStartY.current = window.pageYOffset;
        return;
      }

      if (!ticking.current) {
        requestAnimationFrame(() => {
          // 스크롤이 시작될 때 시작 위치 저장
          if (scrollEndTimeout.current === null) {
            scrollStartY.current = window.pageYOffset;
          }

          // 이전 타이머 취소
          if (scrollEndTimeout.current) {
            clearTimeout(scrollEndTimeout.current);
          }

          // 스크롤이 끝났을 때 방향 판단
          scrollEndTimeout.current = setTimeout(() => {
            const scrollEndY = window.pageYOffset;
            const scrollDistance = scrollEndY - scrollStartY.current;

            // 최소 스크롤 거리 이상일 때만 방향 업데이트
            if (Math.abs(scrollDistance) > MIN_SCROLL_DISTANCE) {
              const direction = scrollDistance > 0 ? 'down' : 'up';
              if (direction !== scrollDirection) {
                setScrollDirection(direction);
              }
            }

            scrollEndTimeout.current = null;
          }, SCROLL_END_DELAY);

          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current);
      }
    };
  }, [scrollDirection, setScrollDirection]);

  return scrollDirection;
}

export function useHeaderVisibility() {
  const scrollDirection = useScrollDirection();
  return scrollDirection ? scrollDirection === 'up' : true;
}
