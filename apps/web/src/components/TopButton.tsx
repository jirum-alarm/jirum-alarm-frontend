'use client';
import { ArrowRight } from '@/components/common/icons';
import { cn } from '@/lib/cn';
import { useEffect, useRef, useState } from 'react';

const TopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const prevScrollPos = useRef(0);

  const topButtonVisibility = () => {
    const isScrollingUp = window.scrollY < prevScrollPos.current;

    if (isScrollingUp) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
    prevScrollPos.current = window.scrollY;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', topButtonVisibility);
    return () => {
      window.removeEventListener('scroll', topButtonVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        `fixed bottom-safe-bottom-96 right-[16px] z-50 flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#101828] opacity-40 transition-opacity layout-max:right-1/2 layout-max:translate-x-[284px]`,
        { 'opacity-0': !isVisible },
      )}
    >
      <ArrowRight color="white" className="-rotate-90" />
    </button>
  );
};

export default TopButton;
