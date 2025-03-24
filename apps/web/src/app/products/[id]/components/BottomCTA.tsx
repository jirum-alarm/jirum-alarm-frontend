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
    <div className="fixed bottom-0 z-40 ml-[-1px] flex h-[72px] w-full max-w-screen-layout-max gap-x-2 border border-gray-100 bg-white px-5 py-2 pb-safe-bottom">
      <LikeButton product={product} isUserLogin={isUserLogin} />

      <a
        href={product.detailUrl ?? ''}
        onClick={handleClickPurchaseLinkBrowse}
        className="block w-full"
      >
        <Button className="min-h-[44px] w-full px-4">구매하러 가기</Button>
      </a>
    </div>
  );
}
