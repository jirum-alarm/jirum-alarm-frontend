'use client';
import { ProductLoading, useHotDealsRandom } from '@/features/products';
import { useInputHideOnScroll } from '../../hooks/(search)/useInputHideOnScroll';
import { useProductListViewModel } from '../../hooks/(search)/useProductListViewModel';
import { useSearchInputViewModel } from '../../hooks/(search)/useSearchInputViewModel';
import RecentKeywords from './RecentKeywords';
import RecommendationKeywords from './RecommendationKeywords';
import { cn } from '@/lib/cn';
import RecommendationProduct from './RecommendationProduct';
import ProductNotFound from './ProductNotFound';
import SearchPageProductList from './ProductList';
import TopButton from '@/components/TopButton';
import SearchPageInput from './SearchInput';

export default function SearchPage() {
  const productViewModel = useProductListViewModel();
  const searchProductViewModel = useSearchInputViewModel();
  const showSearchBar = useInputHideOnScroll();

  return (
    <div className="w-full">
      <header className="fixed z-50 w-full max-w-[600px]">
        <SearchPageInput show={showSearchBar} {...searchProductViewModel} />
      </header>
      <div className="h-14"></div>
      <main>
        <InitialResult show={!searchProductViewModel.keyword} />
        <SearchResult show={!!searchProductViewModel.keyword} {...productViewModel} />
      </main>
    </div>
  );
}

function InitialResult({ show }: { show: boolean }) {
  const { loading, data: { communityRandomRankingProducts: hotDeals } = {} } = useHotDealsRandom();

  return (
    <div className={cn(show ? 'block' : 'hidden')}>
      {loading ? (
        <></>
      ) : (
        <div className="flex flex-col gap-y-5">
          <RecentKeywords />
          <RecommendationKeywords />
          {!hotDeals?.length ? (
            <div className="flex min-h-[500px]">
              <></>
            </div>
          ) : (
            <section>
              <h2 className="py-4">추천 핫딜</h2>
              <RecommendationProduct hotDeals={hotDeals} logging={{ page: 'SEARCH' }} />
            </section>
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
      ) : (
        <div className="flex justify-center pb-10 pt-5">
          {isProductEmpty ? <ProductNotFound /> : <SearchPageProductList products={products} />}
        </div>
      )}

      {!isProductEmpty && <TopButton />}
      {hasNextData && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
