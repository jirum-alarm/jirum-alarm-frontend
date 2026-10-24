'use client';

import { emptyText, text } from '@jirum/design-system/recipes';
import { HOT_FEED_CARD_SOURCE, HOT_FEED_COPY } from '@jirum/domain/ranking';
import { memo, useEffect } from 'react';
import { useSwiper } from 'swiper/react';

import { ProductGridListSkeleton } from '@/entities/product-list/ui/grid';

import useHotFeedViewModel from '../model/useHotFeedViewModel';

import TrackedProductGridList from './TrackedProductGridList';

interface HotFeedListProps {
  categoryId: number | null;
}

const SIZE = 10;

const HotFeedList = ({ categoryId }: HotFeedListProps) => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useHotFeedViewModel({
    categoryId,
  });

  const swiper = useSwiper();

  // LiveList 와 같은 이유 — 무한스크롤로 늘어난 높이를 Swiper autoHeight 가 놓친다.
  useEffect(() => {
    swiper.updateAutoHeight(0);
  }, [products.length, swiper]);

  return (
    <div className="pc:space-y-10 space-y-8">
      <div className="space-y-4 px-5">
        <p className={text.muted}>{HOT_FEED_COPY.lead}</p>
        {products.length === 0 ? (
          <p className={emptyText}>{HOT_FEED_COPY.empty}</p>
        ) : (
          <TrackedProductGridList
            products={products}
            source={HOT_FEED_CARD_SOURCE}
            positionFrom={0}
            priorityCount={4}
          />
        )}
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

export default memo(HotFeedList);
