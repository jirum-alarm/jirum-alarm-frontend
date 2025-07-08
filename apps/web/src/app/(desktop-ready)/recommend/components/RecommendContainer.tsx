'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Suspense } from 'react';

import RecommendProductList from '@/app/(desktop-ready)/recommend/components/RecommendProductList';
import { ProductQueries } from '@/entities/product';
import GridProductListSkeleton from '@/features/products/components/skeleton/GridProductListSkeleton';
import RecommendedProductTabs from '@/features/recommended/RecommendedProductTabs';

const RecommendContainer = ({ isMobile }: { isMobile: boolean }) => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());

  const [recommend, setRecommend] = useQueryState('recommend');
  const validRecommend = recommend && productKeywords.includes(recommend);
  const selectedKeyword = validRecommend ? recommend : productKeywords[0];
  const handleSelectedKeyword = (keyword: string) => {
    setRecommend(keyword);
  };

  const size = isMobile ? 12 : 20;

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
        <Suspense fallback={<GridProductListSkeleton length={size} />}>
          <RecommendProductList keyword={selectedKeyword} />
        </Suspense>
      </div>
    </>
  );
};

export default RecommendContainer;
