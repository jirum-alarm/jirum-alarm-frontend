'use client';
import React from 'react';
import { useProductListViewModel } from '../../hooks/useProductListViewModel';
import ProductRecommendation from '../ProductRecommendation';

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
      <ProductRecommendation showRandomHotDeals={true} products={products} hotDeals={undefined} />
    </div>
  );
};

export default LiveHotDeals;
