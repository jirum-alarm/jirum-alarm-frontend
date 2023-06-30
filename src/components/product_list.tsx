'use client';

import { useSuspenseQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import { useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import SwipeableViews from 'react-swipeable-views';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';

import { QueryProducts } from '../graphql';
import { IProduct, IProductOutput } from '../graphql/interface';
import Product from './product';

import 'react-tabs/style/react-tabs.css';
import '../style/React_tabs.css';
import { QueryCategories } from '../graphql/category';
import { ICategoryOutput } from '../graphql/interface/category';

export default function ProductList() {
  const limit = 20;
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [searchAfter, setSearchAfter] = useState<string[] | undefined>([]);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const { ref, inView } = useInView({ threshold: 0 });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const { data, error, fetchMore } = useSuspenseQuery<IProductOutput>(QueryProducts, {
    variables: { limit },
  });

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const isMobileDevice = useCallback(() => {
    const userAgent = window.navigator.userAgent;
    const isMobileDevice = Boolean(
      userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)
    );
    return isMobileDevice;
  }, []);

  const fetch = useCallback(async () => {
    if (hasNext) {
      if (data.products.length && products.length === 0) {
        setSearchAfter(data.products.at(-1)?.searchAfter);
        setProducts(data.products);
      }

      const categoryId = activeTab === 0 ? undefined : +categoriesData.categories[activeTab - 1].id;

      const newProducts = await fetchMore({
        variables: { limit, searchAfter, categoryId },
      });

      // if (products.some((product) => product.categoryId !== categoryId)) {

      //   setHasNext(true);
      //   setProducts(newProducts.data.products);
      //   const lastProduct = newProducts.data.products.at(-1);
      //   setSearchAfter(lastProduct?.searchAfter);
      //   return;
      // }

      setHasNext(newProducts.data.products.length === limit);
      setProducts([...products, ...newProducts.data.products]);
      const lastProduct1 = newProducts.data.products.at(-1);
      setSearchAfter(lastProduct1?.searchAfter);
    }
  }, [hasNext, inView, activeTab]);

  useEffect(() => {
    setIsMobile(isMobileDevice());

    if (inView && hasNext) {
      fetch();
    }
  }, [inView, hasNext, activeTab]);

  return (
    <main>
      {error ? (
        <p>게시글을 불러오지 못했습니다.</p>
      ) : !data ? (
        <p>로딩중....</p>
      ) : (
        <div>
          <div>
            <Tabs forceRenderTabPanel={true} selectedIndex={activeTab} onSelect={handleTabChange}>
              <TabList>
                <Tab>
                  <button
                    className="inline-block p-4 font-color-black"
                    id="profile-tab"
                    data-tabs-target="#profile"
                    type="button"
                    role="tab"
                    aria-controls="profile"
                    aria-selected="false"
                  >
                    전체
                  </button>
                </Tab>

                {categoriesData.categories.map((category) => (
                  <Tab key={category.id}>
                    <button
                      className="inline-block p-4 "
                      id="profile-tab"
                      data-tabs-target="#profile"
                      type="button"
                      role="tab"
                      aria-controls="profile"
                      aria-selected="false"
                    >
                      {category.name}
                    </button>
                  </Tab>
                ))}
              </TabList>

              <SwipeableViews
                index={activeTab}
                onChangeIndex={handleTabChange}
                animateTransitions={isMobile}
              >
                <TabPanel>
                  <div className="flex">
                    <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
                      {products.map((product) => (
                        <Product key={product.id} product={product}></Product>
                      ))}
                    </div>
                  </div>
                </TabPanel>
                {categoriesData.categories.map((category) => (
                  <TabPanel key={category.id}>
                    <div className="flex">
                      <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
                        {products.map((product) => (
                          <Product key={product.id} product={product}></Product>
                        ))}
                      </div>
                    </div>
                  </TabPanel>
                ))}
              </SwipeableViews>
            </Tabs>
          </div>
        </div>
      )}
      <div ref={ref} className="h-48 w-full" />
    </main>
  );
}
