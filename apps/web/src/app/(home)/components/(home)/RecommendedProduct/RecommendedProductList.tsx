'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense, useMemo } from 'react';

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
  const selectedKeyword = useMemo(() => {
    const isValid = recommend && productKeywords.includes(recommend);
    return isValid ? recommend : productKeywords[0];
  }, [recommend, productKeywords]);
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
