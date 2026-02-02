'use client';

import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { ProductQueries } from '@/entities/product';


interface RelatedProductsViewProps {
  productId: number;
  keyword: string;
  isMobile: boolean;
}

export default function RelatedProductsView({
  productId,
  keyword,
  isMobile,
}: RelatedProductsViewProps) {
  const INITIAL_ITEMS = isMobile ? 6 : 10;
  const ITEMS_PER_PAGE = isMobile ? 6 : 10;

  const { data } = useSuspenseQuery(
    ProductQueries.products({
      keyword,
      limit: 50,
    }),
  );

  const allProducts = Array.from(
    new Map(
      (data?.products ?? []).filter((p) => Number(p.id) !== productId).map((p) => [p.id, p]),
    ).values(),
  );

  const [displayCount, setDisplayCount] = useState(INITIAL_ITEMS);

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && displayCount < allProducts.length) {
        setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, allProducts.length));
      }
    },
  });

  const displayedProducts = allProducts.slice(0, displayCount);
  const hasMore = displayCount < allProducts.length;

  if (allProducts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-gray-500">
        유사한 상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="pc:px-0 px-5 pb-10">
      <ProductGridList
        products={displayedProducts}
        className="pc:grid-cols-5 grid-cols-2 sm:grid-cols-3"
      />
      {hasMore && (
        <div ref={ref} className="flex h-20 items-center justify-center">
          <div className="text-gray-400">로딩중...</div>
        </div>
      )}
    </div>
  );
}
