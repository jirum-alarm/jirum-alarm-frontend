'use client';

import NavBar from '@/components/Navbar';
import ProductList from './ProductList';
import { TopButton } from '@/components/TopButton';
import { useHotDealsRandom } from '@/features/products';
import { cn } from '@/lib/cn';
import ProductLoading from './ProductLoading';
import SearchInput from './SearchInput';
import { useProductListViewModel } from '../hooks/(search)/useProductListViewModel';
import { useSearchInputViewModel } from '../hooks/(search)/useSearchInputViewModel';
import SearchPageInput from './(search)/SearchInput';
import SearchPageProductList from './(search)/ProductList';
import RecentKeywords from './(search)/RecentKeywords';
import RecommendationKeywords from './(search)/RecommendationKeywords';
import RecommendationProduct from './(search)/RecommendationProduct';
import ProductNotFound from './(search)/ProductNotFound';
import { useInputHideOnScroll } from '../hooks/(search)/useInputHideOnScroll';
import { useSearchParams } from 'next/navigation';

export default function HomeContainer() {
  const searchParams = useSearchParams();

  const isSearchPage = searchParams.has('search');

  return (
    <div className="mx-auto max-w-screen-lg px-5">
      {isSearchPage ? <SearchPage /> : <HomePage />}
    </div>
  );
}

function HomePage() {
  return (
    <>
      <header>
        <NavBar />
        <SearchInput />
      </header>
      <main>
        <ProductList />
      </main>
    </>
  );
}

function SearchPage() {
  const productViewModel = useProductListViewModel();
  const searchProductViewModel = useSearchInputViewModel();
  const showSearchBar = useInputHideOnScroll();

  return (
    <>
      <header>
        <SearchPageInput show={showSearchBar} {...searchProductViewModel} />
      </header>
      <main>
        <InitialResult show={!searchProductViewModel.keyword} />
        <SearchResult show={!!searchProductViewModel.keyword} {...productViewModel} />
      </main>
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
              <RecommendationProduct hotDeals={hotDeals} />
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
