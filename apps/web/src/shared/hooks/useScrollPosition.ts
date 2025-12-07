import { useAtom } from 'jotai';
import { useEffect } from 'react';

import { isScrolledAtom } from '@/shared/model/ui';

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
