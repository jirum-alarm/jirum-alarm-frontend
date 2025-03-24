'use client';

import LikeButton from './LikeButton';
import Button from '@/components/common/Button';
import { EVENT } from '@/constants/mixpanel';
import { mp } from '@/lib/mixpanel';
import { ProductQuery } from '@/shared/api/gql/graphql';

export default function BottomCTA({
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
    <div className="fixed bottom-0 z-40 ml-[-1px] flex h-[84px] w-full max-w-screen-layout-max gap-x-4 border border-gray-100 bg-white px-5 py-4">
      <div className="flex min-h-[62px] items-center">
        <LikeButton product={product} isUserLogin={isUserLogin} />
      </div>
      <a
        href={product.detailUrl ?? ''}
        onClick={handleClickPurchaseLinkBrowse}
        className="block flex-1"
      >
        <Button className=" min-h-[56px] w-full px-6 text-base">구매하러 가기</Button>
      </a>
    </div>
  );
}
