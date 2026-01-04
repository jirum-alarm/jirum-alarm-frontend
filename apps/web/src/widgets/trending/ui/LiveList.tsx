'use client';

import { memo, useEffect, useRef } from 'react';
import { useSwiper } from 'swiper/react';

import { ProductGridList, ProductGridListSkeleton } from '@/entities/product-list';

import { useLiveViewModel } from '@/widgets/trending';

interface LiveListProps {
  categoryId: number | null;
}

const SIZE = 10;

const LiveList = ({ categoryId }: LiveListProps) => {
  const swiper = useSwiper();
  const ref = useRef<HTMLDivElement>(null);

  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveViewModel({
    categoryId,
  });

  useEffect(() => {
    if (!ref.current) return;
    swiper.height = ref.current.scrollHeight;
  }, [swiper, ref]);

  return (
    <div ref={ref} className="pc:space-y-10 space-y-8">
      <div className="px-5">
        <ProductGridList products={products} />
      </div>
      <div className="flex w-full items-center justify-center px-5" ref={loadingCallbackRef}>
        {isFetchingNextPage && <ProductGridListSkeleton length={SIZE} />}
      </div>
    </div>
  );
};

export default memo(LiveList);
