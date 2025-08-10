'use client';

import { Suspense } from 'react';

import { GridProductListSkeleton } from '@features/products/grid';

import { RecommendedProductTabs } from '@widgets/recommend';

import useRecommendedKeyword from '../hooks/useRecommendedKeyword';

import RecommendProductList from './RecommendProductList';

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
