import { useEffect, useRef, useState } from 'react';

const VISIBILITY_THRESHOLD = 90;

const useVisibilityOnScroll = () => {
  const lastScrollTop = useRef(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const isScrollingUp = scrollTop < lastScrollTop.current;
    const isScrollingDown = scrollTop > lastScrollTop.current;

    if (scrollTop < VISIBILITY_THRESHOLD) {
      setIsHeaderVisible(false);
      setIsBottomNavVisible(true);
    } else if (scrollTop >= VISIBILITY_THRESHOLD && isScrollingUp) {
      setIsHeaderVisible(true);
      setIsBottomNavVisible(true);
    } else if (isScrollingDown) {
      setIsHeaderVisible(false);
      setIsBottomNavVisible(false);
    }

    lastScrollTop.current = scrollTop;
  };

  useEffect(() => {
    lastScrollTop.current = window.scrollY;
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { isHeaderVisible, isBottomNavVisible };
};

export default useVisibilityOnScroll;
