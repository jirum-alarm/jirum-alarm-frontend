'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import Button from '@/components/common/Button';
import TopButton from '@/components/TopButton';

import { ProductQueries } from '@entities/product';

import { LikeButton } from '@features/product-detail/controls';

export default function BottomCTA({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  return (
    <div className="max-w-mobile-max pb-safe-bottom fixed bottom-0 z-40 flex h-[64px] w-full gap-x-4 border-t border-gray-100 bg-white px-5 py-2">
      <TopButton />
      <div className="flex h-[48px] items-center">
        <LikeButton productId={productId} isUserLogin={isUserLogin} />
      </div>
      <a
        href={product?.detailUrl ?? ''}
        // onClick={handleClickPurchaseLinkBrowse}
        className="block flex-1"
      >
        <Button className="h-[48px] w-full px-6 text-base font-semibold">구매하러 가기</Button>
      </a>
    </div>
  );
}
