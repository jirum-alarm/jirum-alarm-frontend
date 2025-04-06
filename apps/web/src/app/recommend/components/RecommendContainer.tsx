'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

import RecommendedProductTabs from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductTabs';
import RecommendProductList from '@/app/recommend/components/RecommendProductList';
import { IllustStandingSmall } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';

const RecommendContainer = () => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());
  const [keyword, setKeyword] = useQueryState('keyword');
  const selectedKeyword = keyword ?? productKeywords[0];
  const handleSelectedKeyword = (keyword: string) => {
    setKeyword(keyword);
  };
  return (
    <div>
      <div className="sticky top-[56px] z-[50] w-full max-w-screen-layout-max bg-white pb-[20px] pt-[12px]">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={selectedKeyword}
          onSelectedKeyword={(keyword) => handleSelectedKeyword(keyword)}
        />
      </div>
      <Suspense fallback={<RecommendProductListSkeleton />}>
        <RecommendProductList keyword={selectedKeyword} />
      </Suspense>
    </div>
  );
};

export default RecommendContainer;

const RecommendProductListSkeleton = () => {
  return (
    <div className="grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
      {Array.from({ length: 12 }).map((item, i) => (
        <div key={i} className="w-full">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
            <IllustStandingSmall />
          </div>
          <div className="flex flex-col gap-1 pt-2">
            <div className="h-3 bg-gray-100"></div>
            <div className="h-3 w-1/2 bg-gray-100"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
