'use client';

import { memo, useEffect, useRef } from 'react';
import { useSwiper } from 'swiper/react';

import ProductGridList from '@/features/products/components/grid/ProductGridList';
import RecommendationProduct from '@/features/search/components/RecommendationProduct';
import useScreen from '@/hooks/useScreenSize';

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
      <ProductGridList products={products?.slice(0, size) ?? []} loggingPage={'TRENDING'} />
      {liveProducts && (
        <RecommendationProduct
          label={`‘${categoryName}’ 실시간 핫딜`}
          hotDeals={liveProducts}
          logging={{ page: 'TRENDING' }}
          nested
        />
      )}

      <ProductGridList products={products?.slice(size) ?? []} loggingPage={'TRENDING'} />
      {hotDeals && (
        <RecommendationProduct
          label="추천 핫딜"
          hotDeals={hotDeals}
          logging={{ page: 'TRENDING' }}
          nested
        />
      )}
    </div>
  );
};

export default memo(TrendingList);
