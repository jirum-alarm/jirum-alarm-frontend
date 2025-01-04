'use client';

import { Search, Share } from '@/components/common/icons';
import { useToast } from '@/components/common/Toast';
import BackButton from '@/components/layout/BackButton';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import { mp } from '@/lib/mixpanel';
import React from 'react';

export default function RecommendPageHeader() {
  const { toast } = useToast();

  const handleSearch = () => {
    mp.track(EVENT.PRODUCT_SEARCH.NAME, {
      type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
      page: EVENT.PAGE.DETAIL,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      mp.track(EVENT.PRODUCT_SHARE.NAME, {
        type: EVENT.PRODUCT_SHARE.TYPE.SHARE_API,
        page: EVENT.PAGE.DETAIL,
      });

      navigator.share({
        title: '지금 추천하는 상품',
        url: window.location.href,
      });
    } else {
      mp.track(EVENT.PRODUCT_SHARE.NAME, {
        type: EVENT.PRODUCT_SHARE.TYPE.NOT_SHARE_API,
        page: EVENT.PAGE.DETAIL,
      });

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
    <header className="fixed top-0 z-50 flex h-14 w-full max-w-screen-layout-max items-center justify-between bg-white pl-[4px] pr-[20px] text-black">
      <div className="flex w-full items-center">
        <div>{<BackButton backTo={PAGE.HOME} />}</div>
        <h2 className="text-lg font-semibold text-black">지금 추천하는 상품</h2>
      </div>
      <div className="flex w-full items-center justify-end gap-x-[16px]">
        <a
          href={PAGE.SEARCH}
          onClick={handleSearch}
          aria-label="검색"
          title="검색"
          className="py-2"
        >
          <Search color="#101828" />
        </a>
        <button onClick={handleShare} className="hover:cursor-pointer">
          <Share />
        </button>
      </div>
    </header>
  );
}
