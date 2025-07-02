'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense, useEffect } from 'react';

import RecommendProductList from '@/app/(desktop-ready)/recommend/components/RecommendProductList';
import { IllustStandingSmall } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';
import RecommendedProductTabs from '@/features/recommended/RecommendedProductTabs';

const RecommendContainer = () => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());

  const [recommend, setRecommend] = useQueryState('recommend');
  const validRecommend = recommend && productKeywords.includes(recommend);
  const selectedKeyword = validRecommend ? recommend : productKeywords[0];
  const handleSelectedKeyword = (keyword: string) => {
    setRecommend(keyword);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.title = `${selectedKeyword} 추천 상품 | 지름알림`;
  }, [selectedKeyword]);

  return (
    <>
      <div className="sticky top-[56px] z-[50] w-full bg-white py-2 pc:flex pc:justify-center pc:py-3">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={selectedKeyword}
          onSelectedKeyword={(keyword) => handleSelectedKeyword(keyword)}
        />
      </div>
      <div className="px-5 pt-14 pc:pt-7">
        <Suspense fallback={<RecommendProductListSkeleton />}>
          <RecommendProductList keyword={selectedKeyword} />
        </Suspense>
      </div>
    </>
  );
};

export default RecommendContainer;

const RecommendProductListSkeleton = () => {
  return (
    <div className="grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 pc:gap-x-[25px] pc:gap-y-10 sm:grid-cols-3">
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
