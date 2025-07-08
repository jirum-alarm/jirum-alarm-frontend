'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { ProductQueries } from '@/entities/product';

import HorizontalProductListSkeleton from '../products/components/skeleton/HorizontalProductListSkeleton';

import ProductsByKeywordsList from './ProductsByKeywordsList';
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
      <div className="flex justify-center pb-[16px]">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={selectedKeyword}
          onSelectedKeyword={(keyword) => handleSelectedKeyword(keyword)}
        />
      </div>
      <ApiErrorBoundary>
        <Suspense fallback={<HorizontalProductListSkeleton />}>
          <ProductsByKeywordsList keyword={selectedKeyword} />
        </Suspense>
      </ApiErrorBoundary>
    </div>
  );
};

export default RecommendedProductList;
