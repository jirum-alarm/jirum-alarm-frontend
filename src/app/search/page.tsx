'use client';

import { TopButton } from '@/components/TopButton';
import { IProductOutput } from '@/graphql/interface';
import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '@/style/React_tabs.css';
import 'swiper/css';
import ProductLoading from '../(home)/components/ProductLoading';
import ProductNotFound from '../(home)/components/ProductNotFound';
import ProductRecommendation from '../(home)/components/ProductRecommendation';
import RecentKeywords from './components/RecentKeywords';
import RecommendationKeywords from './components/RecommendationKeywords';
import RecommendationProduct from './components/RecommendationProduct';
import SearchInput from './components/SearchInput';
import { useProductListViewModel } from './hooks/useProductListViewModel';
import { useQuery } from '@apollo/client';
import { QueryProducts } from '@/graphql';

export default function Search () {
  const productViewModel = useProductListViewModel();

  return (
    <div className="px-5">
      <header>
        <SearchInput />
      </header>
      <main>
        {!productViewModel.keyword ? <InitialResult /> : <SearchResult {...productViewModel} />}
      </main>
    </div>
  );
};


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
      {!hotDeals || hotDeals?.length === 0  ? (
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
  activeTab,
  handleTabChange,
  isMobile,
  allCategories,
  products,
  hasNextData,
  nextDataRef,
}: ReturnType<typeof useProductListViewModel>) {
  return (
    <Tabs
      className="react-tabs__tab-list"
      forceRenderTabPanel
      selectedIndex={activeTab}
      onSelect={handleTabChange}
      defaultFocus
      disableUpDownKeys
    >
      <TabList
        className={`overflow-x-scroll scroll-smooth will-change-transform ${
          isMobile ? 'whitespace-nowrap' : ''
        }`}
      >
        {allCategories.map((category, i) => (
          <Tab
            key={category.id}
            className="b-0 inline-block p-2 font-bold text-zinc-400 transition duration-200 hover:text-zinc-700"
            id={`profile-tab-${category.id}`}
            data-tabs-target={`#profile-${category.id}`}
            type="button"
            role="tab"
            aria-controls={`profile-${category.id}`}
          >
            <button data-tab-index={i} data-category-id={category.id}>
              {category.name}
            </button>
          </Tab>
        ))}
      </TabList>

      {loading ? (
        <div>
          <ProductLoading />
        </div>
      ) : (
        <div className="flex justify-center">
          <SwipeableViews
            index={activeTab}
            onChangeIndex={(index) => handleTabChange(index, undefined, undefined)}
            animateTransitions={isMobile}
            className="my-6 will-change-transform"
          >
            {allCategories.map((category, i) => {
              const key = `${category.id}_${i}`;

              return (
                <TabPanel key={key}>
                  {products?.length === 0 || !products ? (
                    <div className="flex min-h-[500px]">
                      <ProductNotFound />
                    </div>
                  ) : (
                    <ProductRecommendation products={products} hotDeals={undefined} />
                  )}
                </TabPanel>
              );
            })}
          </SwipeableViews>
        </div>
      )}

      <TopButton />
      {hasNextData && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </Tabs>
  );
}
