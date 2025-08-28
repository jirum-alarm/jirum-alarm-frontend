'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useState } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';

import { ProductQueries } from '@entities/product';

import { CarouselProductListSkeleton } from '@features/products/carousel';

import ProductsByKeywordsList from './ProductsByKeywordsList';
import RecommendedProductTabs from './RecommendedProductTabs';

const RecommendedProductList = () => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());

  const [recommend, setRecommend] = useState(productKeywords[0]);
  const validRecommend = recommend && productKeywords.includes(recommend);
  const selectedKeyword = validRecommend ? recommend : productKeywords[0];
  const handleSelectedKeyword = (keyword: string) => {
    setRecommend(keyword);
  };

  return (
    <div>
      <div className="flex justify-center pb-[16px]">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={selectedKeyword}
          onSelectedKeyword={(keyword) => handleSelectedKeyword(keyword)}
        />
      </div>
      <ApiErrorBoundary>
        <Suspense
          fallback={
            <div className="pc:my-7">
              <CarouselProductListSkeleton />
            </div>
          }
        >
          <ProductsByKeywordsList keyword={selectedKeyword} />
        </Suspense>
      </ApiErrorBoundary>
    </div>
  );
};

export default RecommendedProductList;
