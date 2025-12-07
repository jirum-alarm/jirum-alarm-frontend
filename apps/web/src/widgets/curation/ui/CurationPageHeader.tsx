'use client';

import { PAGE } from '@shared/config/page';
import { Search } from '@shared/ui/icons';
import BackButton from '@shared/ui/layout/BackButton';
import Link from '@shared/ui/Link';
import ShareButton from '@shared/ui/ShareButton';

interface CurationPageHeaderProps {
  title: string;
}

export default function CurationPageHeader({ title }: CurationPageHeaderProps) {
  return (
    <header className="max-w-mobile-max fixed top-0 z-40 flex h-14 w-full items-center justify-between bg-white px-5">
      <div className="flex grow items-center gap-x-1">
        <BackButton backTo={PAGE.HOME} />
        <h2 className="line-clamp-1 text-lg font-semibold text-black">{title}</h2>
      </div>
      <div className="flex items-center gap-x-4">
        <Link href={PAGE.SEARCH} aria-label="검색" title="검색" className="py-2">
          <Search />
        </Link>
        <ShareButton title={`${title} | 지름알림`} />
      </div>
    </header>
  );
}
