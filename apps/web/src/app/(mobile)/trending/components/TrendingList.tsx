'use client';

import { memo, useEffect, useRef } from 'react';
import { useSwiper } from 'swiper/react';

import useScreen from '@/hooks/useScreenSize';

import { CarouselProductsSection } from '@features/products/carousel';
import { GridProductList } from '@features/products/grid';

import useTrendingViewModel from '../hooks/useTrendingViewModel';

interface TrendingListProps {
  categoryId: number | null;
  categoryName: string;
}

const TrendingList = ({ categoryId, categoryName }: TrendingListProps) => {
  const swiper = useSwiper();
  const ref = useRef<HTMLDivElement>(null);
  const { smd } = useScreen();
  const size = smd ? 9 : 10;

  const { products, liveProducts, hotDeals } = useTrendingViewModel({
    categoryId,
  });

  useEffect(() => {
    if (!ref.current) return;
    // FIX: Height 조절 필요
    swiper.height = ref.current.scrollHeight;
  }, [swiper, ref]);

  return (
    <div ref={ref} className="flex flex-col gap-y-8">
      <GridProductList products={products?.slice(0, size) ?? []} rankFrom={1} />
      {liveProducts && (
        <CarouselProductsSection
          title={`‘${categoryName}’ 실시간 핫딜`}
          products={liveProducts}
          nested
        />
      )}

      <GridProductList products={products?.slice(size) ?? []} rankFrom={size + 1} />
      {hotDeals && <CarouselProductsSection title="추천 핫딜" products={hotDeals} nested />}
    </div>
  );
};

export default memo(TrendingList);
