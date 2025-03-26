'use client';

import { memo } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import 'react-tabs/style/react-tabs.css';
import '@/style/React_tabs.css';
import TopButton from '@/components/TopButton';
import { ProductLoading } from '@/features/products';
import { mergeRefs } from '@/util/mergeRefs';

import { useHotDealsViewModel } from '../hooks/useHotDealsViewModel';
import { useProductListViewModel } from '../hooks/useProductListViewModel';

import ProductRecommendation from './ProductRecommendation';

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
          <Tab
            key={category.name}
            className="b-0 inline-block p-2 font-bold text-zinc-400 transition duration-200 hover:text-zinc-700"
            id={`profile-tab-${category.id}`}
            data-tabs-target={`#profile-${category.id}`}
            type="button"
            role="tab"
            aria-controls={`profile-${category.id}`}
          >
            <button>{category.name}</button>
          </Tab>
        ))}
      </TabList>

      <div className="flex justify-center">
        <SwipeableViews
          index={activeTab}
          onChangeIndex={handleTabChange}
          animateTransitions={false}
          className="my-6 will-change-transform"
        >
          {[allCategory].concat(categoriesData.categories).map((category, i) => {
            const key = `${category.id}_${i}`;
            const isAllCategory = i === 0;
            const isHotDeal = i === 1;

            return (
              <TabPanel key={key}>
                {loading || hotDealsLoading ? (
                  <div className="flex h-[60vh] items-center">
                    <ProductLoading />
                  </div>
                ) : (!products?.length && !isHotDeal) || (!hotDeals?.length && isHotDeal) ? (
                  <>해당하는 상품이 없어요.</>
                ) : (
                  <ProductRecommendation
                    showRandomHotDeals={isAllCategory}
                    products={isHotDeal ? hotDeals : products}
                    hotDeals={hotDealsRandom}
                  />
                )}
              </TabPanel>
            );
          })}
        </SwipeableViews>
      </div>

      <TopButton />
      {(hasNextData || hotDealsHasNextData) && (
        <div ref={mergeRefs(ref, hotDealsRef)} className="h-[48px] w-full" />
      )}
    </Tabs>
  );
};

export default memo(ProductList);
