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
    <>
      <div className="mx-auto w-fit max-w-full pb-[16px]">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={selectedKeyword}
          onSelectedKeyword={(keyword) => handleSelectedKeyword(keyword)}
        />
      </div>
      <Suspense
        fallback={
          <div className="pc:my-7 pc:-ml-5">
            <CarouselProductListSkeleton />
          </div>
        }
      >
        <div className="pc:-ml-5">
          <ProductsByKeywordsList keyword={selectedKeyword} />
        </div>
      </Suspense>
    </>
  );
};

export default RecommendedProductList;
