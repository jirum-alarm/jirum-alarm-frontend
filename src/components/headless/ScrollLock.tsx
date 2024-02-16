import React, { useEffect } from 'react';

interface ScrollLockProps {
  children: React.ReactNode;
}

const ScrollLock = ({ children }: ScrollLockProps) => {
  useEffect(() => {
    const nonPassive = { passive: false };
    const preventScroll = (e: Event) => {
      e.preventDefault();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('wheel', preventScroll, nonPassive);
    document.addEventListener('touchmove', preventScroll, nonPassive);
    return () => {
      document.body.style.removeProperty('overflow');
      document.removeEventListener('wheel', preventScroll);
      document.removeEventListener('touchmove', preventScroll);
    };
  }, []);
  return <>{children}</>;
};

export default ScrollLock;
