import { useEffect, useState } from 'react';

const useScrollPosition = (threshold = 100, initialValue = false) => {
  const [isScrolled, setIsScrolled] = useState(initialValue);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
};

export default useScrollPosition;
