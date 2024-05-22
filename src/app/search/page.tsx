'use client';

import { TopButton } from '@/components/TopButton';
import { IProductOutput } from '@/graphql/interface';
import React from 'react';
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

export default function Search() {
  const productViewModel = useProductListViewModel();

  return (
    <div className="mx-auto max-w-screen-lg px-5">
      <header>
        <SearchInput />
      </header>
      <main>
        {!productViewModel.keyword ? <InitialResult /> : <SearchResult {...productViewModel} />}
      </main>
    </div>
  );
}

function InitialResult() {
  const { data: { products: hotDeals } = {}, loading } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit: 10,
      categoryId: 0,
    },
  });

  return loading ? (
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
  );
}

function SearchResult({
  loading,
  products,
  hasNextData,
  nextDataRef,
}: ReturnType<typeof useProductListViewModel>) {
  return (
    <>
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
    </>
  );
}