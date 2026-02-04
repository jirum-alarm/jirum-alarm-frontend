import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';

const isScrolledAtom = atom(false);

const useScrollPosition = (threshold = 100) => {
  const [isScrolled, setIsScrolled] = useAtom(isScrolledAtom);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [setIsScrolled, threshold]);

  return isScrolled;
};

export default useScrollPosition;
