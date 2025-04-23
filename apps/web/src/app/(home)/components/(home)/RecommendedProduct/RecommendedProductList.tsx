'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { IllustStandingSmall } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';

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
      <div className="h-[216px]">
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
    </div>
  );
};

export default RecommendedProductList;

const ProductImageCardListSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-nowrap justify-start gap-[10px] overflow-x-scroll scrollbar-hide">
      {Array.from({ length: 6 }).map((item, i) => (
        <div key={i} className="w-full shrink-0 txs:w-[140px] xs:w-[162px]">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
            <IllustStandingSmall />
          </div>
        </div>
      ))}
    </div>
  );
};
