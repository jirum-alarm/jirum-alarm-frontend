import { Suspense } from 'react';

import { cn } from '@/shared/lib/cn';

import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';

import { SearchInFeedAd } from '@/features/adsense/ui/SearchInFeedAd';

import { useProductListViewModel } from '../hooks/useProductListViewModel';

import ProductNotFound from './ProductNotFound';

// 광고를 보여줄 최소 상품 수. 결과가 너무 적으면 광고를 띄우지 않는다.
const AD_MIN_PRODUCTS = 8;

export default function SearchResult({ show }: { show: boolean }) {
  const { products, hasNextPage, nextDataRef, keyword } = useProductListViewModel();

  const isProductEmpty = !products || products.length === 0;
  const showAd = !isProductEmpty && products.length > AD_MIN_PRODUCTS;

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
