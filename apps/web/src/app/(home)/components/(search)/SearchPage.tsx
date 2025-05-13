'use client';

import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { useInView } from 'react-intersection-observer';

import TopButton from '@/components/TopButton';
import { ProductQueries } from '@/entities/product';
import { cn } from '@/lib/cn';
import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';

import { useInputHideOnScroll } from '../../hooks/(search)/useInputHideOnScroll';
import { useSearchInputViewModel } from '../../hooks/(search)/useSearchInputViewModel';

import SearchPageProductList from './ProductList';
import ProductNotFound from './ProductNotFound';
import RecentKeywords from './RecentKeywords';
import RecommendationKeywords from './RecommendationKeywords';
import RecommendationProduct from './RecommendationProduct';
import SearchPageInput from './SearchInput';

export default function SearchPage() {
  const searchProductViewModel = useSearchInputViewModel();
  const showSearchBar = useInputHideOnScroll();

  return (
    <>
      <header className="sticky left-0 right-0 top-0 z-50 w-full">
        <SearchPageInput show={showSearchBar} {...searchProductViewModel} />
      </header>
      <div className="w-full">
        <main>
          <Suspense>
            <InitialResult show={!searchProductViewModel.keyword} />
          </Suspense>
          <Suspense>
            {!!searchProductViewModel.keyword && (
              <SearchResult
                show={!!searchProductViewModel.keyword}
                keyword={searchProductViewModel.keyword}
              />
            )}
          </Suspense>
        </main>
      </div>
    </>
  );
}

export const HOT_DEAL_COUNT_RANDOM = 20;
export const HOT_DEAL_LIMIT_RANDOM = 10;
function InitialResult({ show }: { show: boolean }) {
  const { data: { communityRandomRankingProducts: hotDeals } = {} } = useSuspenseQuery(
    ProductQueries.hotdealProductsRandom({
      limit: HOT_DEAL_LIMIT_RANDOM,
      count: HOT_DEAL_COUNT_RANDOM,
    }),
  );

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

function SearchResult({ show, keyword }: { show: boolean; keyword: string }) {
  const {
    data: { pages },
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProducts({
      limit: 20,
      keyword,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const products = pages.flatMap((page) => page.products);

  return (
    <div className={cn({ hidden: !show })}>
      {products.length === 0 ? (
        <div className="flex justify-center pb-10 pt-5">
          <Suspense>
            <ProductNotFound />
          </Suspense>
        </div>
      ) : (
        <SearchPageProductList products={products} />
      )}

      <TopButton hasBottomNav={false} />
      {hasNextPage && <div ref={ref} className="h-[48px] w-full" />}
    </div>
  );
}
