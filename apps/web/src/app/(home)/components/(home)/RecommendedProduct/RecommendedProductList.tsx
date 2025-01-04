'use client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ProductQueries } from '@/entities/product';
import { Suspense } from 'react';
import ProductImageCardList from '@/app/(home)/components/(home)/RecommendedProduct/ProductImageCardList';
import { IllustStandingSmall } from '@/components/common/icons';
import RecommendedProductTabs from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductTabs';
import useTabQueryString from '@/hooks/useTabQueryString';

const RecommendedProductList = () => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());

  const { currentTab, setTabChange } = useTabQueryString('keyword');
  const selectedKeyword = currentTab ?? productKeywords[0];
  const handleSelectedKeyword = (keyword: string) => {
    setTabChange(keyword);
  };

  return (
    <div>
      <div className="h-[216px]">
        <div className="pb-[16px]">
          <RecommendedProductTabs
            productKeywords={productKeywords}
            selectedKeyword={selectedKeyword}
            onSelectedKeyword={(keyword) => handleSelectedKeyword(keyword)}
          />
        </div>
        <Suspense fallback={<ProductImageCardListSkeleton />}>
          <ProductImageCardList keyword={selectedKeyword} />
        </Suspense>
      </div>
    </div>
  );
};

export default RecommendedProductList;

const ProductImageCardListSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-nowrap justify-start gap-[10px] overflow-x-scroll scrollbar-hide">
      {Array.from({ length: 6 }).map((item, i) => (
        <div key={i} className="w-full shrink-0 txs:w-[140px] xs:w-[162px]">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
            <IllustStandingSmall />
          </div>
        </div>
      ))}
    </div>
  );
};
