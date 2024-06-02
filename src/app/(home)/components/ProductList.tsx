'use client';
import { TopButton } from '@/components/TopButton';
import SwipeableViews from 'react-swipeable-views';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '@/style/React_tabs.css';
import ProductLoading from './ProductLoading';
import SearchInput from './SearchInput';
import { useProductListViewModel } from '../hooks/useProductListViewModel';
import React from 'react';
import ProductRecommendation from './ProductRecommendation';
import { useHotDealsViewModel } from '../hooks/useHotDealsViewModel';
import { mergeRefs } from '@/util/mergeRefs';
import { useHotDealsRandom } from '@/features/products';

const ProductList = () => {
  const {
    loading,
    activeTab,
    handleTabChange,
    isMobile,
    allCategory,
    products,
    categoriesData,
    hasNextData,
    ref,
  } = useProductListViewModel();

  const {
    hotDeals,
    hotDealsRandom,
    loading: hotDealsLoading,
    hasNextData: hotDealsHasNextData,
    ref: hotDealsRef,
  } = useHotDealsViewModel();

  return (
    <main>
      <SearchInput />
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
          {[allCategory].concat(categoriesData.categories).map((category) => (
            <React.Fragment key={category.name}>
              <Tab
                className="b-0 inline-block p-2 font-bold text-zinc-400 transition duration-200 hover:text-zinc-700"
                id={`profile-tab-${category.id}`}
                data-tabs-target={`#profile-${category.id}`}
                type="button"
                role="tab"
                aria-controls={`profile-${category.id}`}
              >
                <button>{category.name}</button>
              </Tab>
            </React.Fragment>
          ))}
        </TabList>

        {loading || hotDealsLoading ? (
          <div>
            <ProductLoading />
          </div>
        ) : (
          <div className="flex justify-center">
            <SwipeableViews
              index={activeTab}
              onChangeIndex={handleTabChange}
              animateTransitions={isMobile}
              className="my-6 will-change-transform"
            >
              {[allCategory].concat(categoriesData.categories).map((category, i) => {
                const key = `${category.id}_${i}`;
                const isAllCategory = i === 0;
                const isHotDeal = i === 1;

                return (
                  <TabPanel key={key}>
                    {loading ? (
                      <></>
                    ) : (!products?.length && i !== 1) || !hotDeals?.length ? (
                      <>해당하는 상품이 없어요.</>
                    ) : (
                      <ProductRecommendation
                        products={isHotDeal ? hotDeals : products}
                        hotDeals={isAllCategory ? hotDeals : undefined}
                        hotDealsRandom={hotDealsRandom}
                      />
                    )}
                  </TabPanel>
                );
              })}
            </SwipeableViews>
          </div>
        )}

        <TopButton />
        {(hasNextData || hotDealsHasNextData) && (
          <div ref={mergeRefs(ref, hotDealsRef)} className="h-[48px] w-full" />
        )}
      </Tabs>
    </main>
  );
};

export default ProductList;
