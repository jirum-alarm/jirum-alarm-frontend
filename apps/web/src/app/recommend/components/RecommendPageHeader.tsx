'use client';

import { Search, Share } from '@/components/common/icons';
import { useToast } from '@/components/common/Toast';
import BackButton from '@/components/layout/BackButton';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';

export default function RecommendPageHeader() {
  const { toast } = useToast();

  const handleSearch = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.RECOMMEND,
    // });
  };

  const handleShare = () => {
    if (navigator.share) {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_SHARE.NAME, {
      //   type: EVENT.PRODUCT_SHARE.TYPE.SHARE_API,
      //   page: EVENT.PAGE.RECOMMEND,
      // });

      navigator.share({
        title: '지금 추천하는 상품',
        url: window.location.href,
      });
    } else {
      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_SHARE.NAME, {
      //   type: EVENT.PRODUCT_SHARE.TYPE.NOT_SHARE_API,
      //   page: EVENT.PAGE.RECOMMEND,
      // });

      navigator.clipboard.writeText(window.location.href);
      toast(
        <>
          링크가 클립보드에 복사되었어요!
          <br />
          원하는 곳에 붙여 넣어 공유해보세요!
        </>,
      );
    }
  };

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
        <button
          onClick={handleShare}
          className="-m-2 p-2 hover:cursor-pointer"
          aria-label="공유하기"
          title="공유하기"
        >
          <Share />
        </button>
      </div>
    </header>
  );
}
