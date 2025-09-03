'use client';

import BackButton from '@/components/layout/BackButton';
import BasicLayout from '@/components/layout/BasicLayout';
import { cn } from '@/lib/cn';
import SearchInput from '@/widgets/search/components/SearchInput';
import { useInputHideOnScroll } from '@/widgets/search/hooks/useInputHideOnScroll';

export default function MobileSearchLayout({ children }: { children: React.ReactNode }) {
  const showSearchBar = useInputHideOnScroll();

  return (
    <BasicLayout
      header={
        <header
          className={cn(
            'max-w-mobile-max fixed top-0 right-0 left-0 z-50 mx-auto flex h-14 w-full items-center gap-x-1 bg-white px-5',
            showSearchBar
              ? 'flex opacity-100 transition-opacity duration-150'
              : 'pointer-events-none opacity-0 transition-opacity duration-150',
          )}
        >
          <BackButton />
          <SearchInput />
        </header>
      }
    >
      <div className="mt-14 w-full pt-2">{children}</div>
    </BasicLayout>
  );
}
