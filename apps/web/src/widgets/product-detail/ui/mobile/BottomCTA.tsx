'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import Button from '@/shared/ui/common/Button';
import TopButton from '@/shared/ui/TopButton';

import { ProductQueries } from '@/entities/product';

import { LikeButton } from '@/features/product-actions/ui';

export default function BottomCTA({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  return (
    <div className="max-w-mobile-max pb-safe-bottom bg-surface-default border-t-border-strong fixed bottom-0 left-1/2 z-50 mx-auto w-full -translate-x-1/2 border-t">
      <div className="flex w-full items-center gap-x-4 px-5 py-2">
        <TopButton />
        <div className="flex h-[48px] items-center">
          <LikeButton productId={productId} isUserLogin={isUserLogin} />
        </div>
        <a
          href={product?.detailUrl ?? ''}
          // onClick={handleClickPurchaseLinkBrowse}
          className="block flex-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="typography-title-16sb h-[48px] w-full px-6">구매하러 가기</Button>
        </a>
      </div>
    </div>
  );
}
