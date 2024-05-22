'use client';

import { TopButton } from '@/components/TopButton';
import { IProductOutput } from '@/graphql/interface';
import React, { useCallback, useEffect, useState } from 'react';
import ProductLoading from '../(home)/components/ProductLoading';
import ProductNotFound from '../(home)/components/ProductNotFound';
import RecentKeywords from './components/RecentKeywords';
import RecommendationKeywords from './components/RecommendationKeywords';
import RecommendationProduct from './components/RecommendationProduct';
import SearchInput from './components/SearchInput';
import { useProductListViewModel } from './hooks/useProductListViewModel';
import { useQuery } from '@apollo/client';
import { QueryProducts } from '@/graphql';
import ProductList from './components/ProductList';
import { cn } from '@/lib/cn';
import { throttle } from 'lodash';
import { useSearchInputViewModel } from './hooks/useSearchInputViewModel';

export default function Search() {
  const [showSearchBar, setShowSearchBar] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  const productViewModel = useProductListViewModel();
  const searchProductViewModel = useSearchInputViewModel();

  const handleScroll = useCallback(() => {
    throttle(() => {
      const currentScrollPos = window.scrollY;
      setShowSearchBar(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    }, 300)();
  }, [prevScrollPos]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div className="mx-auto max-w-screen-lg px-5">
      <header>
        <SearchInput show={showSearchBar} {...searchProductViewModel} />
      </header>
      <main>
        <InitialResult show={!searchProductViewModel.keyword} />
        <SearchResult show={!!searchProductViewModel.keyword} {...productViewModel} />
      </main>
    </div>
  );
}

function InitialResult({ show }: { show: boolean }) {
  const { data: { products: hotDeals } = {}, loading } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit: 10,
      categoryId: 0,
    },
  });

  return (
    <div className={cn(show ? 'block' : 'hidden')}>
      {loading ? (
        <>{/* empty loading */}</>
      ) : (
        <div className="flex flex-col gap-y-5">
          <RecentKeywords />
          <RecommendationKeywords />
          {!hotDeals || hotDeals?.length === 0 ? (
            <div className="flex min-h-[500px]">
              <ProductNotFound />
            </div>
          ) : (
            <RecommendationProduct hotDeals={hotDeals} />
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
  return (
    <div className={cn(show ? 'block' : 'hidden')}>
      {loading ? (
        <div>
          <ProductLoading />
        </div>
      ) : (
        <div className="flex justify-center pt-5">
          {products?.length === 0 || !products ? (
            <div className="flex min-h-[500px]">
              <ProductNotFound />
            </div>
          ) : (
            <ProductList products={products} />
          )}
        </div>
      )}

      <TopButton />
      {hasNextData && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
