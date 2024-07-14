'use client';
import React from 'react';
import { useProductListViewModel } from '../../hooks/useProductListViewModel';
import ProductRecommendation from '../ProductRecommendation';
import { IllustStandingSmall, LoadingSpinner } from '@/components/common/icons';
import Image from 'next/image';

const LiveHotDeals = () => {
  const {
    loading,
    activeTab,
    handleTabChange,
    isMobile,
    allCategory,
    products,
    categoriesData,
    hasNextData,
    ref,
  } = useProductListViewModel();
  return (
    <div className="px-4">
      <div className="flex items-center justify-between pb-5 pt-2">
        <h2 className="text-lg font-semibold text-gray-900">실시간 핫딜</h2>
      </div>
      <LiveHotDealsSkeleton />
      {/* <ProductRecommendation showRandomHotDeals={true} products={products} hotDeals={undefined} /> */}
      <div className="flex h-[250px] w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );
};

const LiveHotDealsSkeleton = () => {
  return (
    <div className="grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
      {Array.from({ length: 10 }).map((item, i) => (
        <div key={i} className="txs:w-[140px] xs:w-[162px]">
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-300 txs:h-[140px] xs:h-[162px]">
            <IllustStandingSmall />
          </div>
          <div className="flex flex-col gap-1 pt-2">
            <div className="h-3 bg-gray-300"></div>
            <div className="h-3 w-1/2 bg-gray-300"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveHotDeals;
