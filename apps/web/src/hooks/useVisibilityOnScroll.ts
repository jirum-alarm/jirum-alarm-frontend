import { useEffect, useRef, useState } from 'react';

const useVisibilityOnScroll = ({ visibilityThreshold }: { visibilityThreshold?: number } = {}) => {
  const lastScrollTop = useRef(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(visibilityThreshold ? false : true);
  const threshold = visibilityThreshold ?? 0;

  const handleScroll = () => {
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
  };

  useEffect(() => {
    lastScrollTop.current = window.scrollY;
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { isHeaderVisible };
};

export default useVisibilityOnScroll;
