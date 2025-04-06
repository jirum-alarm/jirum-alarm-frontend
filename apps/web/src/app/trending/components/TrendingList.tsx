'use client';

import { memo, useEffect } from 'react';

import RecommendationProduct from '@/app/(home)/components/(search)/RecommendationProduct';
import { ProductTrendingImageCard } from '@/features/products';
import useScreen from '@/hooks/useScreenSize';

import useTrendingViewModel from '../hooks/useTrendingViewModel';

interface TrendingListProps {
  categoryId: number | null;
  categoryName: string;
  onReady?: () => void;
}

const TrendingList = ({ categoryId, categoryName, onReady }: TrendingListProps) => {
  const { smd } = useScreen();
  const size = smd ? 9 : 10;

  const { products, liveProducts, hotDeals } = useTrendingViewModel({
    categoryId,
  });

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div className="flex flex-col gap-y-8">
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
        {products
          ?.slice(0, size)
          .map((product, i) => (
            <ProductTrendingImageCard
              key={product.id}
              product={product}
              rank={i + 1}
              logging={{ page: 'TRENDING' }}
            />
          ))}
      </div>
      {liveProducts && (
        <div>
          <div className="flex w-full items-center justify-between pb-4">
            <span className="font-bold text-gray-900">{`‘${categoryName}’ 실시간 핫딜`}</span>
          </div>
          <RecommendationProduct hotDeals={liveProducts} logging={{ page: 'TRENDING' }} />
        </div>
      )}

      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
        {products
          ?.slice(size)
          .map((product, i) => (
            <ProductTrendingImageCard
              key={product.id}
              product={product}
              rank={i + size + 1}
              logging={{ page: 'TRENDING' }}
            />
          ))}
      </div>
      {hotDeals && (
        <div>
          <div className="pb-4 pt-9 text-base">추천 핫딜</div>
          <RecommendationProduct hotDeals={hotDeals} logging={{ page: 'TRENDING' }} />
        </div>
      )}
      {/* <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div> */}
    </div>
  );
};

export default memo(TrendingList);
