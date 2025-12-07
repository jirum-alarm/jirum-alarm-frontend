'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@shared/lib/cn';
import { ArrowRight } from '@shared/ui/icons';

const TopButton = ({ type = 'scrolling-up' }: { type?: 'scrolling-up' | 'scrolled' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const prevScrollPos = useRef(0);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const topButtonVisibility = () => {
      if (type === 'scrolled') {
        const isScrolled = window.scrollY >= window.innerHeight;

        if (isScrolled) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
        return;
      }

      const isScrollingUp = window.scrollY < prevScrollPos.current;
      prevScrollPos.current = window.scrollY;

      if (isScrollingUp) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', topButtonVisibility);
    return () => {
      window.removeEventListener('scroll', topButtonVisibility);
    };
  }, [type]);

  return (
    <button
      onClick={scrollToTop}
      aria-label="스크롤 최상단 이동"
      className={cn(
        `absolute -top-14 right-[16px] z-50 flex h-[40px] w-[40px] items-center justify-center rounded-full border border-gray-300 bg-white opacity-100 shadow-[0_2px_12px_0_rgba(0,0,0,0.08)] transition-opacity`,
        {
          'opacity-0': !isVisible,
        },
      )}
    >
      <ArrowRight color="#475467" className="-rotate-90" />
    </button>
  );
};

export default TopButton;
