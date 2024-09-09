'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import SearchPageProductList from './(search)/ProductList';
import ProductNotFound from './(search)/ProductNotFound';
import RecentKeywords from './(search)/RecentKeywords';
import RecommendationKeywords from './(search)/RecommendationKeywords';
import RecommendationProduct from './(search)/RecommendationProduct';
import SearchPageInput from './(search)/SearchInput';
import ProductList from './ProductList';
import SearchInput from './SearchInput';
import { useInputHideOnScroll } from '../hooks/(search)/useInputHideOnScroll';
import { useProductListViewModel } from '../hooks/(search)/useProductListViewModel';
import { useSearchInputViewModel } from '../hooks/(search)/useSearchInputViewModel';

import NavBar from '@/components/Navbar';
import TopButton from '@/components/TopButton';
import { useHotDealsRandom, ProductLoading } from '@/features/products';
import { cn } from '@/lib/cn';

export default function HomeContainer() {
  const searchParams = useSearchParams();

  const [showSearchPage, setShowSearchPage] = useState(false);

  const isSearchPage = searchParams.has('search');

  const goSearchPage = () => {
    history.pushState({}, '', '/?search');
    setShowSearchPage(true);
  };

  useEffect(() => {
    if (isSearchPage) {
      setShowSearchPage(false);
    }
  }, [isSearchPage]);

  return (
    <div className="mx-auto max-w-screen-lg overflow-y-hidden px-5">
      {isSearchPage || showSearchPage ? <SearchPage /> : <HomePage goSearchPage={goSearchPage} />}
    </div>
  );
}

function HomePage({ goSearchPage }: { goSearchPage: () => void }) {
  return (
    <>
      <header>
        <NavBar />
        <SearchInput goSearchPage={goSearchPage} />
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
