'use client';

import { memo } from 'react';

import { ProductGridList, ProductGridListSkeleton } from '@/entities/product-list/ui/grid';

import useLiveViewModel from '../model/useLiveViewModel';

interface LiveListProps {
  categoryId: number | null;
}

const SIZE = 10;

const LiveList = ({ categoryId }: LiveListProps) => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveViewModel({
    categoryId,
  });

  return (
    <div className="pc:space-y-10 space-y-8">
      <div className="px-5">
        <ProductGridList products={products} />
      </div>
      <div
        className="flex min-h-10 w-full items-center justify-center px-5"
        ref={loadingCallbackRef}
      >
        {isFetchingNextPage && <ProductGridListSkeleton length={SIZE} />}
      </div>
    </div>
  );
};

export default memo(LiveList);
