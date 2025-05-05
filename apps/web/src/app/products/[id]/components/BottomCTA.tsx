'use client';

import Button from '@/components/common/Button';
import { ProductQuery } from '@/shared/api/gql/graphql';

import LikeButton from './LikeButton';

export default function BottomCTA({
  product,
  isUserLogin,
}: {
  product: NonNullable<ProductQuery['product']>;
  isUserLogin: boolean;
}) {
  const handleClickPurchaseLinkBrowse = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_PURCHASE_LINK_BROWSE.NAME, {
    //   page: EVENT.PAGE.DETAIL,
    // });
  };

  return (
    <div className="fixed bottom-0 z-40 ml-[-1px] flex h-[64px] w-full max-w-screen-layout-max gap-x-4 border border-gray-100 bg-white px-5 py-2">
      <div className="flex h-[48px] items-center">
        <LikeButton product={product} isUserLogin={isUserLogin} />
      </div>
      <a
        href={product.detailUrl ?? ''}
        onClick={handleClickPurchaseLinkBrowse}
        className="block flex-1"
      >
        <Button className="h-[48px] w-full px-6 text-base font-semibold">구매하러 가기</Button>
      </a>
    </div>
  );
}
