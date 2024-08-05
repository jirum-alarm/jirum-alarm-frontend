'use client';

import { IProduct } from '@/graphql/interface';
import LikeButton from './LikeButton';
import Button from '@/components/common/Button';
import { EVENT } from '@/constants/mixpanel';
import { mp } from '@/lib/mixpanel';

export default function BottomCTA({
  product,
  isUserLogin,
}: {
  product: IProduct;
  isUserLogin: boolean;
}) {
  const handleClickPurchaseLinkBrowse = () => {
    mp.track(EVENT.PRODUCT_PURCHASE_LINK_BROWSE.NAME, {
      page: EVENT.PAGE.DETAIL,
    });
  };

  return (
    <div className="fixed bottom-0 z-40 ml-[-1px] flex w-full max-w-screen-layout-max gap-x-2 border border-gray-100 bg-white px-5 pb-6 pt-4">
      <LikeButton product={product} isUserLogin={isUserLogin} />

      <a href={product.detailUrl} onClick={handleClickPurchaseLinkBrowse} className="w-full">
        <Button>구매하러 가기</Button>
      </a>
    </div>
  );
}
