'use client';

import TopButton from '@/components/TopButton';
import { ProductLoading, useHotDealsRandom } from '@/features/products';
import { cn } from '@/lib/cn';

import SearchPageProductList from './components/ProductList';
import ProductNotFound from './components/ProductNotFound';
import RecentKeywords from './components/RecentKeywords';
import RecommendationKeywords from './components/RecommendationKeywords';
import RecommendationProduct from './components/RecommendationProduct';
import SearchPageInput from './components/SearchInput';
import { useInputHideOnScroll } from './hooks/useInputHideOnScroll';
import { useProductListViewModel } from './hooks/useProductListViewModel';
import { useSearchInputViewModel } from './hooks/useSearchInputViewModel';

export default function SearchPage() {
  const productViewModel = useProductListViewModel();
  const searchProductViewModel = useSearchInputViewModel();
  const showSearchBar = useInputHideOnScroll();

  return (
    <>
      <header className="sticky left-0 right-0 top-0 z-50 w-full">
        <SearchPageInput show={showSearchBar} {...searchProductViewModel} />
      </header>
      <div className="w-full">
        <main>
          <InitialResult show={!searchProductViewModel.keyword} />
          <SearchResult show={!!searchProductViewModel.keyword} {...productViewModel} />
        </main>
      </div>
    </>
  );
}

function InitialResult({ show }: { show: boolean }) {
  const { loading, data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  return (
    <div className={cn(show ? 'block' : 'hidden')}>
      {loading ? (
        <></>
      ) : (
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
      )}
    </div>
  );
}

function SearchResult({
  show,
  loading,
  products,
  hasNextData,
  nextDataRef,
}: ReturnType<typeof useProductListViewModel> & { show: boolean }) {
  const isProductEmpty = !products || products.length === 0;

  return (
    <div className={cn({ hidden: !show })}>
      {loading ? (
        <div className="flex h-[90vh] items-center justify-center">
          <ProductLoading />
        </div>
      ) : isProductEmpty ? (
        <div className="flex justify-center pb-10 pt-5">
          <ProductNotFound />
        </div>
      ) : (
        <SearchPageProductList products={products} />
      )}

      {!isProductEmpty && (
        <div className="fixed bottom-0 left-0 right-0">
          <TopButton />
        </div>
      )}
      {hasNextData && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
