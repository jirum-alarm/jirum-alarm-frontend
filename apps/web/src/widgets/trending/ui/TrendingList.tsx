'use client';

import { memo, useEffect, useRef } from 'react';
import { useSwiper } from 'swiper/react';

import useScreen from '@shared/hooks/useScreenSize';

import { CarouselProductsSection } from '@features/product-list/carousel';
import { GridProductList } from '@features/product-list/grid';

import useTrendingViewModel from '@widgets/trending/model/useTrendingViewModel';

interface TrendingListProps {
  categoryId: number | null;
  categoryName: string;
}

const SIZE = 10;

const TrendingList = ({ categoryId, categoryName }: TrendingListProps) => {
  const swiper = useSwiper();
  const ref = useRef<HTMLDivElement>(null);

  const { products, liveProducts, hotDeals } = useTrendingViewModel({
    categoryId,
  });

  useEffect(() => {
    if (!ref.current) return;
    // FIX: Height 조절 필요
    swiper.height = ref.current.scrollHeight;
  }, [swiper, ref]);

  return (
    <div ref={ref} className="pc:space-y-10 space-y-8">
      <div className="px-5">
        <GridProductList products={products?.slice(0, SIZE) ?? []} rankFrom={1} />
      </div>
      {liveProducts && (
        <CarouselProductsSection
          title={`‘${categoryName}’ 실시간 핫딜`}
          products={liveProducts}
          nested
          shouldShowMobileHeader={false}
        />
      )}
      <div className="px-5">
        <GridProductList products={products?.slice(SIZE) ?? []} rankFrom={SIZE + 1} />
      </div>

      {hotDeals && (
        <CarouselProductsSection
          title="추천 핫딜"
          products={hotDeals}
          nested
          shouldShowMobileHeader={false}
        />
      )}
    </div>
  );
};

export default memo(TrendingList);
