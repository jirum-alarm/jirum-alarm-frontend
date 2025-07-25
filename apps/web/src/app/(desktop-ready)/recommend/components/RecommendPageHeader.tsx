'use client';

import { Search } from '@/components/common/icons';
import { useToast } from '@/components/common/Toast';
import BackButton from '@/components/layout/BackButton';
import ShareButton from '@/components/ShareButton';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';

import useRecommendedKeyword from '../hooks/useRecommendedKeyword';

export default function RecommendPageHeader() {
  const { recommendedKeyword: keyword } = useRecommendedKeyword();

  const { toast } = useToast();

  const handleSearch = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.RECOMMEND,
    // });
  };

  const title = keyword ? `${keyword} 추천 상품 | 지름알림` : '지금 추천하는 상품';

  return (
    <header className="fixed top-0 z-50 flex h-[56px] w-full max-w-screen-mobile-max items-center justify-between bg-white px-5">
      <div className="flex grow items-center gap-x-1">
        <BackButton backTo={PAGE.HOME} />
        <h2 className="text-lg font-semibold text-black">지금 추천하는 상품</h2>
      </div>
      <div className="flex items-center gap-x-4">
        <Link
          href={PAGE.SEARCH}
          onClick={handleSearch}
          aria-label="검색"
          title="검색"
          className="py-2"
        >
          <Search />
        </Link>
        <ShareButton title={title} />
      </div>
    </header>
  );
}
