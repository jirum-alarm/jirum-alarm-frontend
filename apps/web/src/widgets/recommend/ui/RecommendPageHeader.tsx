'use client';

import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import BackButton from '@/shared/ui/layout/BackButton';
import PageHeader from '@/shared/ui/layout/PageHeader';
import Link from '@/shared/ui/Link';
import ShareButton from '@/shared/ui/ShareButton';

import useRecommendedKeyword from '../model/useRecommendedKeyword';

export default function RecommendPageHeader() {
  const { recommendedKeyword: keyword } = useRecommendedKeyword();

  const title = keyword ? `${keyword} 추천 상품 | 지름알림` : '지금 추천하는 상품';

  return (
    <PageHeader
      leading={<BackButton backTo={PAGE.HOME} />}
      title="지금 추천하는 상품"
      actions={
        <>
          <Link href={PAGE.SEARCH} aria-label="검색" title="검색" className="-m-2 p-2">
            <Search />
          </Link>
          <ShareButton title={title} />
        </>
      }
    />
  );
}
