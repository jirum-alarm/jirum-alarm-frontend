import { Suspense } from 'react';

import { cn } from '@/shared/lib/cn';

import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';
import ProductGridListSkeleton from '@/entities/product-list/ui/grid/ProductGridListSkeleton';

import { SearchInFeedAd } from '@/features/adsense/ui/SearchInFeedAd';

import { useProductListViewModel } from '../hooks/useProductListViewModel';
import { useSearchFilters } from '../hooks/useSearchFilters';

import ProductNotFound from './ProductNotFound';
import SearchFilterBar from './SearchFilterBar';

// 광고를 보여줄 최소 상품 수. 결과가 너무 적으면 광고를 띄우지 않는다.
const AD_MIN_PRODUCTS = 8;

export default function SearchResult({ show }: { show: boolean }) {
  // 필터 상태의 소유자는 이 컴포넌트 하나 — setFilters의 transition isPending으로 그리드를 디밍하고,
  // viewModel/FilterBar에는 값을 내려보낸다(인스턴스 중복 시 transition이 깨짐, 훅 주석 참고).
  const filterController = useSearchFilters();
  const { filters, hasActiveFilters, resetFilters } = filterController;
  const { products, hasNextPage, nextDataRef, keyword, isLoading, isPlaceholderData } =
    useProductListViewModel({ filters });

  const isProductEmpty = !products || products.length === 0;
  const showAd = !isProductEmpty && products.length > AD_MIN_PRODUCTS;

  return (
    <div className={cn({ hidden: !show })}>
      {/* 필터 바는 빈 결과에서도 노출 — 필터를 풀 수 있어야 하므로 */}
      <SearchFilterBar controller={filterController} />
      {isLoading ? (
        <div className="pc:px-0 px-5">
          <ProductGridListSkeleton length={20} />
        </div>
      ) : isProductEmpty ? (
        <div className="flex justify-center pt-5 pb-10">
          {hasActiveFilters ? (
            <div className="flex flex-col items-center gap-4 pt-5 text-center">
              <p className="text-sm text-gray-500">
                선택한 필터에 맞는 결과가 없어요.
                <br />
                필터를 조정하면 더 많은 딜을 볼 수 있어요.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-[40px] border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
              >
                필터 초기화
              </button>
            </div>
          ) : (
            <Suspense fallback={<></>}>
              <ProductNotFound />
            </Suspense>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'pc:px-0 px-5 transition-opacity',
            isPlaceholderData && 'pointer-events-none opacity-50',
          )}
        >
          {/* 광고는 그리드 '밖' 독립 블록으로 둔다. 그리드 안/사이에 끼우면 직전 카드 수가
              컬럼 수(모바일2·sm3·pc5)의 배수가 아닐 때 그 행 끝에 빈칸이 생긴다(실측: pc 5열에서
              8번째 뒤 = 빈칸 2개). 그리드를 통째로 렌더하면 항상 꽉 차고 빈칸이 없다. */}
          {showAd && <SearchInFeedAd dedupeKey={keyword ?? ''} />}
          <ProductGridList products={products} source="search" />
        </div>
      )}

      {hasNextPage && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
