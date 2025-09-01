import { throttle } from 'es-toolkit';
import { useCallback, useEffect, useState } from 'react';

export const useInputHideOnScroll = () => {
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  const handleScroll = useCallback(() => {
    throttle(() => {
      const currentScrollPos = window.scrollY;
      setShowSearchBar(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    }, 300)();
  }, [prevScrollPos]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return showSearchBar;
};
