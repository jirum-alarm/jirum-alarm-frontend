'use client';

import { Suspense } from 'react';

import { ProductGridListSkeleton } from '@/entities/product-list';

import { RecommendedProductTabs, useRecommendedKeyword } from '@/widgets/recommend';

import RecommendProductList from './RecommendProductList';

const RecommendContainer = ({ isMobile }: { isMobile: boolean }) => {
  const { recommendedKeyword, setRecommendedKeyword, productKeywords } = useRecommendedKeyword();

  const handleSelectedKeyword = (keyword: string) => {
    setRecommendedKeyword(keyword);
  };

  const size = isMobile ? 12 : 20;

  return (
    <>
      <div className="pc:flex pc:justify-center pc:py-3 sticky top-14 z-40 w-full bg-white px-5 py-2">
        <RecommendedProductTabs
          productKeywords={productKeywords}
          selectedKeyword={recommendedKeyword}
          onSelectedKeyword={handleSelectedKeyword}
        />
      </div>
      <div className="pc:pt-7 px-5 pt-14">
        <Suspense fallback={<ProductGridListSkeleton length={size} />}>
          <RecommendProductList keyword={recommendedKeyword} limit={size} />
        </Suspense>
      </div>
    </>
  );
};

export default RecommendContainer;
