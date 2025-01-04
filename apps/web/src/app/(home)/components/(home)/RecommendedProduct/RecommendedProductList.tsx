'use client';
import { useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { ProductQueries } from '@/entities/product';
import { Suspense, useState } from 'react';
import ProductImageCardList from '@/app/(home)/components/(home)/RecommendedProduct/ProductImageCardList';
import { cn } from '@/lib/cn';
import { IllustStandingSmall } from '@/components/common/icons';

const RecommendedProductList = () => {
  const {
    data: { productKeywords },
  } = useSuspenseQuery(ProductQueries.productKeywords());
  const [selectedKeyword, setSelectedKeyword] = useState<string>(productKeywords[0]);

  const handleKeywordClick = (keyword: string) => {
    return (e: React.MouseEvent<HTMLLIElement>) => {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      setSelectedKeyword(keyword);
    };
  };

  return (
    <div>
      <ul className="no-wrap flex gap-2 overflow-x-scroll pb-4 scrollbar-hide">
        {productKeywords.map((keyword) => (
          <li
            key={keyword}
            onClick={handleKeywordClick(keyword)}
            className={cn(`shrink-0 rounded-[40px] border transition-all`, {
              'border-secondary-500 bg-secondary-50 font-semibold text-secondary-800':
                selectedKeyword === keyword,
              'border-gray-300 bg-white text-gray-700': selectedKeyword !== keyword,
            })}
          >
            <button className="px-[16px] py-[6px]">{keyword}</button>
          </li>
        ))}
      </ul>
      <div className="h-[216px]">
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
