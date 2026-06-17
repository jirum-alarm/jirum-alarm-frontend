'use client';

import { useState } from 'react';

import { useDevice } from '@/shared/hooks/useDevice';

import { type ProductCardType } from '@/entities/product-list/model/types';

import ProductGridList from './ProductGridList';

type PaginatedProductGridListProps = {
  products: ProductCardType[];
  isMobile: boolean;
  itemsPerPage?: number;
  className?: string;
};

export default function PaginatedProductGridList({
  products,
  isMobile,
  itemsPerPage: initialItemsPerPage,
  className,
}: PaginatedProductGridListProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = initialItemsPerPage ?? (!isMobile ? 5 : 4);
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
      <div className="pc:px-0 px-5">
        <ProductGridList products={currentProducts} className={className} />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleNextPage}
          className="typography-body-14m bg-surface-muted text-fg-primary flex h-9 items-center gap-2.5 rounded-lg px-5"
        >
          추천 상품 더보기
          <span>
            <span className="text-fg-primary">{currentPage + 1}</span>
            <span className="text-fg-secondary">/{totalPages}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
