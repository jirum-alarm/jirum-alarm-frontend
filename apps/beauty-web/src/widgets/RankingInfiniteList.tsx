'use client';

import { emptyText } from '@jirum/design-system/recipes';
import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchProductPage } from '@/shared/api/client';
import { type BeautyProduct, nextCursor, type ProductListVariables } from '@/shared/api/products';
import { CARD_SOURCE } from '@/shared/config/beauty';
import { cn } from '@/shared/lib/cn';
import { LoadingSpinner } from '@/shared/ui/icons';
import ProductCard, { ProductGrid } from '@/widgets/ProductCard';

/**
 * 뷰티 랭킹 무한 스크롤. 서버가 첫 쪽(initial)을 HTML 에 심고, 바닥 400px 전에 다음 쪽을 searchAfter 로 이어 받는다.
 * variables 는 서버가 쓴 것 그대로 받는다 — startDate(KST 60일 전 자정)가 서버·브라우저에서 같아야 순서가 이어진다.
 */
export default function RankingInfiniteList({
  initial,
  variables,
}: {
  initial: BeautyProduct[];
  variables: ProductListVariables;
}) {
  const [products, setProducts] = useState(initial);
  const [cursor, setCursor] = useState(() => nextCursor(initial, variables.limit));
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    setFailed(false);
    try {
      const page = await fetchProductPage({ ...variables, searchAfter: cursor });
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...page.filter((p) => !seen.has(p.id))];
      });
      setCursor(nextCursor(page, variables.limit));
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, variables]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !cursor || failed) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMore();
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, failed, loadMore]);

  if (products.length === 0) {
    return <p className={cn('py-20 text-center', emptyText)}>지금 진행 중인 뷰티 핫딜이 없어요.</p>;
  }

  return (
    <>
      <ProductGrid>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
            tracking={{ source: CARD_SOURCE.RANKING, position: index, rank: index + 1 }}
          />
        ))}
      </ProductGrid>
      <div ref={sentinelRef} className="flex w-full items-center justify-center py-6">
        {loading && <LoadingSpinner />}
        {failed && (
          <button
            type="button"
            onClick={() => void loadMore()}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700"
          >
            다시 불러오기
          </button>
        )}
      </div>
    </>
  );
}
