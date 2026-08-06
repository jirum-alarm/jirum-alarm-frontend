'use client';

import { cn } from '@/shared/lib/cn';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import PageHeader from '@/shared/ui/layout/PageHeader';

import { useInputHideOnScroll } from '@/widgets/search/hooks/useInputHideOnScroll';
import SearchInput from '@/widgets/search/ui/SearchInput';

export default function MobileSearchLayout({ children }: { children: React.ReactNode }) {
  const showSearchBar = useInputHideOnScroll();

  return (
    <BasicLayout
      header={
        <PageHeader
          className={cn(
            'transition-opacity duration-150',
            !showSearchBar && 'pointer-events-none opacity-0',
          )}
        >
          <BackButton />
          <div className="min-w-0 grow">
            <SearchInput />
          </div>
        </PageHeader>
      }
    >
      <div className="w-full pt-2">{children}</div>
    </BasicLayout>
  );
}
