'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { ProductQueries } from '@/entities/product';
import ProductImageCardSkeleton from '@/features/products/components/ProductImageCardSkeleton';

import ProductImageCardList from './ProductImageCardList';
import RecommendedProductTabs from './RecommendedProductTabs';

const RecommendedProductList = () => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());

  const [recommend, setRecommend] = useQueryState('recommend');
  const validRecommend = recommend && productKeywords.includes(recommend);
  const selectedKeyword = validRecommend ? recommend : productKeywords[0];
  const handleSelectedKeyword = (keyword: string) => {
    setRecommend(keyword);
  };

  return (
    <div>
      <div className="pb-[16px]">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={selectedKeyword}
          onSelectedKeyword={(keyword) => handleSelectedKeyword(keyword)}
        />
      </div>
      <ApiErrorBoundary>
        <Suspense fallback={<ProductImageCardListSkeleton />}>
          <ProductImageCardList keyword={selectedKeyword} />
        </Suspense>
      </ApiErrorBoundary>
    </div>
  );
};

export default RecommendedProductList;

const ProductImageCardListSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-nowrap justify-start gap-x-3 overflow-x-scroll scrollbar-hide">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[120px] shrink-0">
          <ProductImageCardSkeleton />
        </div>
      ))}
    </div>
  );
};
