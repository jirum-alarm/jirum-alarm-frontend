'use client';

import { useState } from 'react';

import { useDevice } from '@/hooks/useDevice';

import { type ProductCardType } from '../type';

import ProductGridList from './GridProductList';

type PaginatedProductGridListProps = {
  products: ProductCardType[];
  isMobile: boolean;
};

export default function PaginatedProductGridList({
  products,
  isMobile,
}: PaginatedProductGridListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = !isMobile ? 5 : 4;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const currentProducts = products.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="px-5">
        <ProductGridList products={currentProducts} />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleNextPage}
          className="flex h-9 items-center gap-2.5 rounded-lg bg-gray-100 px-5 text-sm font-medium text-gray-900"
        >
          추천 상품 더보기
          <span>
            <span className="text-gray-900">{currentPage + 1}</span>
            <span className="text-gray-500">/{totalPages}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
