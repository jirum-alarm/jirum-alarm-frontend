'use client';

import { memo } from 'react';

import { CarouselProductsSection } from '@/entities/product-list/ui/carousel';
import { ProductGridList } from '@/entities/product-list/ui/grid';

import useTrendingViewModel from '../model/useTrendingViewModel';

interface TrendingListProps {
  categoryId: number | null;
  categoryName: string;
}

const SIZE = 10;

const TrendingList = ({ categoryId, categoryName }: TrendingListProps) => {
  const { products, liveProducts, hotDeals } = useTrendingViewModel({
    categoryId,
  });

  return (
    <div className="pc:space-y-10 pc:pb-0 space-y-8 pb-[var(--bottom-nav-padding,0px)]">
      <div className="px-5">
        <ProductGridList products={products?.slice(0, SIZE) ?? []} rankFrom={1} priorityCount={5} />
      </div>
      {liveProducts && (
        <CarouselProductsSection
          title={`'${categoryName}' 실시간 핫딜`}
          products={liveProducts}
          nested
          shouldShowMobileHeader={false}
          priorityCount={3}
        />
      )}
      <div className="px-5">
        <ProductGridList products={products?.slice(SIZE) ?? []} rankFrom={SIZE + 1} />
      </div>

      {hotDeals && (
        <CarouselProductsSection
          title="추천 핫딜"
          products={hotDeals}
          nested
          shouldShowMobileHeader={false}
          priorityCount={3}
        />
      )}
    </div>
  );
};

export default memo(TrendingList);
