'use client';

import { Suspense } from 'react';

import { PAGE } from '@/shared/config/page';
import { Search } from '@/shared/ui/common/icons';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';
import BackButton from '@/shared/ui/layout/BackButton';
import Link from '@/shared/ui/Link';

import ProductShareButton from './ProductShareButton';

export default function ProductDetailPageHeader({ productId }: { productId: number }) {
  const handleSearch = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
    //   type: EVENT.PRODUCT_SEARCH.TYPE.CLICK,
    //   page: EVENT.PAGE.DETAIL,
    // });
  };

  return (
    <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-5">
      <div className="flex min-w-0 items-center gap-x-1">
        <BackButton backTo={PAGE.HOME} />
        {/* 상세로 유입된 사람의 90%가 이 한 장만 보고 이탈하고, 홈·랭킹 도달은 0.4%다.
            로고만으로는 "여기가 뭐 하는 곳인지" 전달되지 않아 서비스 인지가 안 생긴다.

            태그라인은 로고 옆/아래가 아니라 로고 자체의 부제로 붙인다. h-14 안에 두 줄을
            쌓으면 여백이 4.5px 로 답답하고, 옆에 두면 375px 에서 폭이 모자라 줄바꿈된다.
            아이콘 기준 왼쪽 정렬로 위에 로고, 아래 부제 — 헤더 높이는 그대로 둔다. */}
        <LogoLink subtitle="커뮤니티 핫딜 모아보기" />
      </div>
      <div className="flex items-center gap-x-4">
        <Link
          href={PAGE.SEARCH}
          onClick={handleSearch}
          aria-label="검색"
          title="검색"
          className="-m-2 p-2"
        >
          <Search />
        </Link>
        <Suspense>
          <ProductShareButton productId={productId} />
        </Suspense>
      </div>
    </header>
  );
}
