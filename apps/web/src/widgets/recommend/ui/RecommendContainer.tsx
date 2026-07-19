'use client';

import { Suspense } from 'react';

import { ProductGridListSkeleton } from '@/entities/product-list/ui/grid';

import { RecommendedProductTabs } from '@/widgets/recommend';

import useRecommendedKeyword from '../model/useRecommendedKeyword';

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
      {/* sticky 탭 바로 아래 그리드. 모바일 상단 여백 최소(pt-6), PC는 pt-7 유지 (toss/curation과 동일 패턴) */}
      <div className="pc:pt-7 px-5 pt-6">
        <Suspense fallback={<ProductGridListSkeleton length={size} />}>
          <RecommendProductList keyword={recommendedKeyword} limit={size} />
        </Suspense>
      </div>
    </>
  );
};

export default RecommendContainer;
