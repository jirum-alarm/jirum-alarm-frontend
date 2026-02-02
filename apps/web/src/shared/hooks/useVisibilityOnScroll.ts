import { atom, useAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';

const isHeaderVisibleAtom = atom(false);

const useVisibilityOnScroll = ({ visibilityThreshold }: { visibilityThreshold?: number } = {}) => {
  const lastScrollTop = useRef(0);
  const [isHeaderVisible, setIsHeaderVisible] = useAtom(isHeaderVisibleAtom);
  const threshold = visibilityThreshold ?? 0;

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY < 0 ? 0 : window.scrollY;
    const isScrollingUp = scrollTop < lastScrollTop.current;
    const isScrollingDown = scrollTop > lastScrollTop.current;

    if (scrollTop < threshold) {
      setIsHeaderVisible(false);
    } else if (scrollTop >= threshold && isScrollingUp) {
      setIsHeaderVisible(true);
    } else if (isScrollingDown) {
      setIsHeaderVisible(false);
    }

    lastScrollTop.current = scrollTop;
  }, [setIsHeaderVisible, threshold]);

  useEffect(() => {
    lastScrollTop.current = window.scrollY;
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return { isHeaderVisible };
};

export default useVisibilityOnScroll;
