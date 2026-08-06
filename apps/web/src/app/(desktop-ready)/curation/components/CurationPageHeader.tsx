'use client';

import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import BackButton from '@/shared/ui/layout/BackButton';
import PageHeader from '@/shared/ui/layout/PageHeader';
import Link from '@/shared/ui/Link';
import ShareButton from '@/shared/ui/ShareButton';

interface CurationPageHeaderProps {
  title: string;
}

export default function CurationPageHeader({ title }: CurationPageHeaderProps) {
  return (
    <PageHeader
      leading={<BackButton backTo={PAGE.HOME} />}
      title={title}
      actions={
        <>
          <Link href={PAGE.SEARCH} aria-label="검색" title="검색" className="-m-2 p-2">
            <Search />
          </Link>
          <ShareButton title={`${title} | 지름알림`} />
        </>
      }
    />
  );
}
