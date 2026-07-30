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
            fixed 헤더는 상세에서 100% 노출되는 두 자리 중 하나라 여기에 한 줄을 붙인다.

            세로로 쌓되 LogoLink 의 py-1(위아래 4px)을 상쇄해 공간을 되찾는다. 그냥 쌓으면
            로고블록 36px + 태그라인 11px = 47px 라 h-14(56px) 안에서 위아래 4.5px 밖에
            안 남아 답답하다. -my-1 로 8px 을 회수하면 39px 이 되어 여유가 17px 로 늘어난다.
            헤더 높이 자체는 그대로라 sticky top-14 계산이 안 깨진다. */}
        {/* whitespace-nowrap 은 필수다. 로고("지름알림")도 태그라인도 폭이 좁아지면
            줄바꿈돼서 헤더 높이를 밀어버린다. shrink-0 로 좌측 블록이 눌리지 않게 하고,
            줄어들 여지는 우측 아이콘 쪽이 아니라 이 블록 밖에서 흡수한다. */}
        <div className="-my-1 flex shrink-0 flex-col whitespace-nowrap">
          <LogoLink />
          {/* 로고 글자는 LogoLink 안쪽 px-2(8px) + 아이콘(24px) + gap-2(8px) 만큼 들어가 있다.
              태그라인도 같은 40px 을 들여써야 두 줄의 왼쪽선이 맞는다. */}
          <span className="pl-10 text-[11px] leading-none text-gray-500">
            커뮤니티 핫딜 모아보기
          </span>
        </div>
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
