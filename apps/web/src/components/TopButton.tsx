'use client';

import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { AiOutlineArrowUp } from 'react-icons/ai';

export const TopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', toggleVisibility);

      return () => {
        window.removeEventListener('scroll', toggleVisibility);
      };
    }
  }, []);

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-8 right-8">
          <button
            type="button"
            onClick={scrollToTop}
            className={classNames(
              'inline-flex items-center rounded-full bg-blue-500 p-3 text-white shadow-sm transition-opacity hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2',
            )}
          >
            <AiOutlineArrowUp className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
};
