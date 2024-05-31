'use client';

import { TopButton } from '@/components/TopButton';
import { IProductOutput, OrderOptionType, ProductOrderType } from '@/graphql/interface';
import React, { useCallback, useEffect, useState } from 'react';
import ProductLoading from '../(home)/components/ProductLoading';
import ProductNotFound from './components/ProductNotFound';
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

const now = new Date();
const kstDate = new Date(now.getTime() + 9 * 60 * 60 * 1000);
const twoDaysAgo = new Date(kstDate.getTime() - 2 * 24 * 60 * 60 * 1000);
const startDate = twoDaysAgo.toISOString();

function InitialResult({ show }: { show: boolean }) {
  const { data: { products: hotDeals } = {}, loading } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit: 10,
      categoryId: 0,
      startDate,
      orderBy: ProductOrderType.COMMUNITY_RANKING_RANDOM,
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
        <div>
          <ProductLoading />
        </div>
      ) : (
        <div className="flex justify-center pb-10 pt-5">
          {isProductEmpty ? <ProductNotFound /> : <ProductList products={products} />}
        </div>
      )}

      {!isProductEmpty && <TopButton />}
      {hasNextData && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
