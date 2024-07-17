'use client';
import { cn } from '@/lib/cn';
import useVisibilityOnScroll from '../../hooks/useVisibilityOnScroll';
import { Logo } from '@/components/common/icons';
import SearchButton from './SearchButton';

const HomeHeader = () => {
  const { isHeaderVisible } = useVisibilityOnScroll();
  return (
    <header
      className={cn(
        `fixed top-0 z-50 flex w-full max-w-screen-sm items-center justify-between bg-white px-5 py-3 transition-opacity duration-500`,
        {
          'opacity-0': !isHeaderVisible,
          'opacity-100': isHeaderVisible,
        },
      )}
    >
      <div className="flex items-center gap-2">
        <Logo />
        <h2 className="text-lg font-semibold text-gray-900">지름알림</h2>
      </div>
      <SearchButton color="#101828" />
    </header>
  );
};

export default HomeHeader;
