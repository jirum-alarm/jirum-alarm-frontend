import RecommendationProduct from '@/app/search/components/RecommendationProduct';
import { IllustError } from '@/components/common/icons';
import Link from '@/features/Link';
import { useHotDeals } from '@/features/products';
import React from 'react';

const ProductNotFound = () => {
  const { data } = useHotDeals();
  const hotDeals = data?.products;

  return (
    <div className="flex h-full w-full flex-col items-start justify-center pt-11">
      <div className="w-full pb-8 text-center">
        <div className="flex justify-center pb-4">
          <IllustError />
        </div>
        <p className="pb-2 text-2xl font-semibold text-gray-900">검색 결과가 없어요.</p>
        <p className="text-gray-500">키워드를 등록하고 알림을 받아보세요.</p>
      </div>
      <div className="w-full pb-16 text-center">
        <button className="rounded-lg bg-gray-800 px-5 py-1.5 font-semibold text-primary-500">
          <Link href="/mypage/keyword">키워드 등록</Link>
        </button>
      </div>
      <hr className="w-full border-gray-300" />
      <div className="w-full pt-10">
        <div className="flex w-full items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">오늘 가장 인기있는 핫딜</span>
          <span className="text-sm text-gray-500">
            <Link href="/">더보기</Link>
          </span>
        </div>
      </div>
      <div className="w-full pt-4">
        {!hotDeals || hotDeals?.length === 0 ? (
          <div className="flex min-h-[500px]">
            <ProductNotFound />
          </div>
        ) : (
          <RecommendationProduct hotDeals={hotDeals} />
        )}
      </div>
    </div>
  );
};

export default ProductNotFound;
