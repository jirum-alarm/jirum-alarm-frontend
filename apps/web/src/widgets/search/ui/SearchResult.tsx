import { Suspense } from 'react';

import { cn } from '@/shared/lib/cn';

import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';

import { SearchInFeedAd } from '@/features/adsense/ui/SearchInFeedAd';

import { useProductListViewModel } from '../hooks/useProductListViewModel';

import ProductNotFound from './ProductNotFound';

// 첫 결과를 충분히 보여준 뒤 광고를 끼운다. 그리드 흐름이 깨지지 않도록
// 이 지점에서 리스트를 둘로 나누고 사이에 풀폭 광고 1개만 넣는다.
const AD_AFTER = 8;

export default function SearchResult({ show }: { show: boolean }) {
  const { products, hasNextPage, nextDataRef, keyword } = useProductListViewModel();

  const isProductEmpty = !products || products.length === 0;
  const showAd = !isProductEmpty && products.length > AD_AFTER;

  return (
    <div className={cn({ hidden: !show })}>
      {isProductEmpty ? (
        <div className="flex justify-center pt-5 pb-10">
          <Suspense fallback={<></>}>
            <ProductNotFound />
          </Suspense>
        </div>
      ) : (
        <div className="pc:px-0 px-5">
          {/* 그리드는 하나로 유지하고 광고만 한 줄(전체 폭)로 끼운다.
              예전엔 그리드를 둘로 쪼개 8번째 뒤가 컬럼 수와 안 맞으면 빈칸이 생겼다. */}
          <ProductGridList
            products={products}
            source="search"
            slotAfter={showAd ? AD_AFTER : undefined}
            slot={showAd ? <SearchInFeedAd dedupeKey={keyword ?? ''} /> : undefined}
          />
        </div>
      )}

      {hasNextPage && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
