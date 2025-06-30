'use client';

import { memo, useEffect, useRef } from 'react';
import { useSwiper } from 'swiper/react';

import { ProductTrendingImageCard } from '@/features/products';
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
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
        {products?.slice(0, size).map((product, i) => (
          <ProductTrendingImageCard
            key={product.id}
            product={product}
            rank={i + 1}
            logging={{ page: 'TRENDING' }}
          />
        ))}
      </div>
      {liveProducts && (
        <RecommendationProduct
          label={`‘${categoryName}’ 실시간 핫딜`}
          hotDeals={liveProducts}
          logging={{ page: 'TRENDING' }}
          nested
        />
      )}

      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
        {products?.slice(size).map((product, i) => (
          <ProductTrendingImageCard
            key={product.id}
            product={product}
            rank={i + size + 1}
            logging={{ page: 'TRENDING' }}
          />
        ))}
      </div>
      {hotDeals && (
        <RecommendationProduct
          label="추천 핫딜"
          hotDeals={hotDeals}
          logging={{ page: 'TRENDING' }}
          nested
        />
      )}
      {/* <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div> */}
    </div>
  );
};

export default memo(TrendingList);
