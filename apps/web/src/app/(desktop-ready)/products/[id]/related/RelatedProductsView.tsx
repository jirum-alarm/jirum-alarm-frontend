'use client';

import { emptyText } from '@jirum/design-system/recipes';
import { useSuspenseQueries } from '@tanstack/react-query';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { cn } from '@/shared/lib/cn';

import { ProductQueries } from '@/entities/product';
import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';

interface RelatedProductsViewProps {
  productId: number;
  isMobile: boolean;
}

// 종료 딜 블록의 '더보기' — 블록과 같은 출처(동일상품 그룹 → 이 글보다 새 같은 상품·같은 라인 진행 딜).
// 예전 제목 키워드 검색(50개, 오래된 글 포함)은 무관 상품이 섞였다.
export default function RelatedProductsView({ productId, isMobile }: RelatedProductsViewProps) {
  const INITIAL_ITEMS = isMobile ? 6 : 10;
  const ITEMS_PER_PAGE = isMobile ? 6 : 10;

  const [{ data: sameData }, { data: latestData }] = useSuspenseQueries({
    queries: [
      ProductQueries.sameProductDeals({ id: productId }),
      ProductQueries.latestSimilarDeals({ id: productId, limit: 20 }),
    ],
  });

  const allProducts = Array.from(
    new Map(
      [...(sameData.sameProductDeals ?? []), ...(latestData.latestSimilarDeals ?? [])]
        .filter((p) => Number(p.id) !== productId)
        .map((p) => [p.id, p]),
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
      <div className={cn('flex h-40 items-center justify-center', emptyText)}>
        유사한 상품이 없습니다.
      </div>
    );
  }

  return (
    <div className="pc:px-0 px-5 pb-10">
      <ProductGridList
        products={displayedProducts}
        className="pc:grid-cols-5 grid-cols-2 sm:grid-cols-3"
        source="related"
      />
      {hasMore && (
        <div ref={ref} className="flex h-20 items-center justify-center">
          <div className="text-gray-400">로딩중...</div>
        </div>
      )}
    </div>
  );
}
