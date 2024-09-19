'use client';

import React from 'react';
import LikeButton from './LikeButton';
import Button from '@/components/common/Button';
import { EVENT } from '@/constants/mixpanel';
import { mp } from '@/lib/mixpanel';
import { BiSolidMessageDetail } from 'react-icons/bi';
import { ProductQuery } from '@/shared/api/gql/graphql';

function BottomCTA({
  product,
  isUserLogin,
}: {
  product: NonNullable<ProductQuery['product']>;
  isUserLogin: boolean;
}) {
  const handleClickPurchaseLinkBrowse = () => {
    mp.track(EVENT.PRODUCT_PURCHASE_LINK_BROWSE.NAME, {
      page: EVENT.PAGE.DETAIL,
    });
  };

  return (
    <div className="fixed bottom-0 z-40 ml-[-1px] flex w-full max-w-screen-layout-max flex-col border border-gray-200 bg-white px-5 pb-6 pt-2">
      <div className="mb-2">
        <div className="flex items-center rounded-md bg-gray-100 px-3 py-2">
          <div className="mr-2 flex flex-shrink-0 items-center justify-center">
            <BiSolidMessageDetail size={16} className="relative top-[1px] text-gray-500" />
          </div>
          <span className="flex-grow text-xs leading-tight text-gray-600">
            일부 링크는 제휴 마케팅이 적용되어 지름알림에 커미션이 지급될 수 있어요
          </span>
        </div>
      </div>
      <div className="flex w-full gap-x-2">
        <LikeButton product={product} isUserLogin={isUserLogin} />
        <a href={product.detailUrl!} onClick={handleClickPurchaseLinkBrowse} className="w-full">
          <Button>구매하러 가기</Button>
        </a>
      </div>
    </div>
  );
}

export default React.memo(BottomCTA);
