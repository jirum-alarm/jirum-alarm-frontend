'use client';

import { memo } from 'react';

import { CarouselProductsSection } from '@/entities/product-list/ui/carousel';

import useTrendingViewModel from '../model/useTrendingViewModel';

import TrackedProductGridList from './TrackedProductGridList';

interface TrendingListProps {
  categoryId: number | null;
  categoryName: string;
}

const SIZE = 10;
// 랭킹 탭 노출/클릭 출처. 백엔드 CTR 집계가 이 값으로 필터한다.
const RANKING_SOURCE = 'ranking_tab';

const TrendingList = ({ categoryId, categoryName }: TrendingListProps) => {
  const { products, liveProducts, hotDeals } = useTrendingViewModel({
    categoryId,
  });

  return (
    <div className="pc:space-y-10 space-y-8">
      <div className="px-5">
        <TrackedProductGridList
          products={products?.slice(0, SIZE) ?? []}
          source={RANKING_SOURCE}
          rankFrom={1}
          positionFrom={0}
          priorityCount={5}
        />
      </div>
      {liveProducts && (
        <CarouselProductsSection
          title={`'${categoryName}' 실시간 핫딜`}
          products={liveProducts}
          nested
          shouldShowMobileHeader={false}
          priorityCount={3}
          source="trending_live"
        />
      )}
      <div className="px-5">
        <TrackedProductGridList
          products={products?.slice(SIZE) ?? []}
          source={RANKING_SOURCE}
          rankFrom={SIZE + 1}
          positionFrom={SIZE}
        />
      </div>

      {hotDeals && (
        <CarouselProductsSection
          title="추천 핫딜"
          products={hotDeals}
          nested
          shouldShowMobileHeader={false}
          priorityCount={3}
          source="trending_recommend"
        />
      )}
    </div>
  );
};

export default memo(TrendingList);
