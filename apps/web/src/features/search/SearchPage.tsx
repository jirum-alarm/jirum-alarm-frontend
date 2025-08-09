'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import TopButton from '@/components/TopButton';
import { cn } from '@/lib/cn';

import { useHotDealsRandom } from '../products/hooks';

import ProductNotFound from './components/ProductNotFound';
import RecentKeywords from './components/RecentKeywords';
import RecommendationKeywords from './components/RecommendationKeywords';
import RecommendationProduct from './components/RecommendationProduct';
import SearchPageInput from './components/SearchInput';
import { useInputHideOnScroll } from './hooks/useInputHideOnScroll';
import { useProductListViewModel } from './hooks/useProductListViewModel';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get('keyword');

  const showSearchBar = useInputHideOnScroll();

  return (
    <>
      <header className="sticky left-0 right-0 top-0 z-50 w-full">
        <SearchPageInput show={showSearchBar} />
      </header>
      <div className="w-full">
        <main>
          <Suspense>
            <InitialResult show={!keywordParam} />
          </Suspense>
          <Suspense>
            <SearchResult show={!!keywordParam} />
          </Suspense>
        </main>
      </div>
    </>
  );
}

function InitialResult({ show }: { show: boolean }) {
  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  return (
    <div className={cn(show ? 'block' : 'hidden')}>
      <div className="flex flex-col gap-y-5 pt-2">
        <RecentKeywords />
        <RecommendationKeywords />
        {!hotDeals?.length ? (
          <div className="flex min-h-[500px]">
            <></>
          </div>
        ) : (
          <RecommendationProduct
            label="추천 핫딜"
            hotDeals={hotDeals}
            logging={{ page: 'SEARCH' }}
          />
        )}
      </div>
    </div>
  );
}

function SearchResult({ show }: { show: boolean }) {
  const { products, hasNextPage, nextDataRef } = useProductListViewModel();

  const isProductEmpty = !products || products.length === 0;

  return (
    <div className={cn({ hidden: !show })}>
      {isProductEmpty ? (
        <div className="flex justify-center pb-10 pt-5">
          <Suspense fallback={<></>}>
            <ProductNotFound />
          </Suspense>
        </div>
      ) : (
        // TODO: SearchPageProductList가 존재하지 않아 임시로 캐러셀로 대체 표시
        <RecommendationProduct
          label="검색 결과"
          hotDeals={products as any}
          logging={{ page: 'SEARCH' }}
        />
      )}

      {!isProductEmpty && (
        <div className="fixed bottom-0 left-0 right-0">
          <TopButton />
        </div>
      )}
      {hasNextPage && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
