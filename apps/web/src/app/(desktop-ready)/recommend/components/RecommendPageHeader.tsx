'use client';

import { Search } from '@/components/common/icons';
import BackButton from '@/components/layout/BackButton';
import { PAGE } from '@/constants/page';

import Link from '@shared/ui/Link';
import ShareButton from '@shared/ui/ShareButton';

import useRecommendedKeyword from '../hooks/useRecommendedKeyword';

export default function RecommendPageHeader() {
  const { recommendedKeyword: keyword } = useRecommendedKeyword();

  const title = keyword ? `${keyword} 추천 상품 | 지름알림` : '지금 추천하는 상품';

  return (
    <header className="fixed top-0 z-40 flex h-[56px] w-full max-w-screen-mobile-max items-center justify-between bg-white px-5">
      <div className="flex grow items-center gap-x-1">
        <BackButton backTo={PAGE.HOME} />
        <h2 className="text-lg font-semibold text-black">지금 추천하는 상품</h2>
      </div>
      <div className="flex items-center gap-x-4">
        <Link href={PAGE.SEARCH} aria-label="검색" title="검색" className="py-2">
          <Search />
        </Link>
        <ShareButton title={title} />
      </div>
    </header>
  );
}
