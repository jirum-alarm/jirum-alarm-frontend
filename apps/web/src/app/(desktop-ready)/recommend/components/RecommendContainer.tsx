'use client';

import { Suspense } from 'react';

import RecommendProductList from '@/app/(desktop-ready)/recommend/components/RecommendProductList';
import GridProductListSkeleton from '@/features/products/components/skeleton/GridProductListSkeleton';
import RecommendedProductTabs from '@/features/recommended/RecommendedProductTabs';

import useRecommendedKeyword from '../hooks/useRecommendedKeyword';

const RecommendContainer = ({ isMobile }: { isMobile: boolean }) => {
  const { recommendedKeyword, setRecommendedKeyword, productKeywords } = useRecommendedKeyword();

  const handleSelectedKeyword = (keyword: string) => {
    setRecommendedKeyword(keyword);
  };

  const size = isMobile ? 12 : 20;

  return (
    <>
      <div className="sticky top-[56px] z-40 w-full bg-white px-5 py-2 pc:flex pc:justify-center pc:py-3">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={recommendedKeyword}
          onSelectedKeyword={handleSelectedKeyword}
        />
      </div>
      <div className="px-5 pt-14 pc:pt-7">
        <Suspense fallback={<GridProductListSkeleton length={size} />}>
          <RecommendProductList keyword={recommendedKeyword} limit={size} />
        </Suspense>
      </div>
    </>
  );
};

export default RecommendContainer;
