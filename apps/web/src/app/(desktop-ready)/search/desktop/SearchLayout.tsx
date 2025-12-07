'use client';

import { SearchInput } from '@/widgets/search';

export default function DesktopSearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-layout-max mx-auto mt-14 grid grid-cols-12 gap-x-6">
      <div className="sticky top-14 z-40 col-span-12 grid w-full grid-cols-12 gap-x-6 bg-white pt-7">
        <div className="col-span-8 col-start-3 flex h-14 items-center">
          <SearchInput />
        </div>
      </div>
      <div className="col-span-10 col-start-2 pt-6">{children}</div>
    </div>
  );
}
