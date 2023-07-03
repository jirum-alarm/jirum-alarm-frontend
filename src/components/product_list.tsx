"use client";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import SwipeableViews from "react-swipeable-views";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "../style/React_tabs.css";

import { QueryProducts } from "../graphql";
import { QueryCategories } from "../graphql/category";
import { IProduct, IProductOutput } from "../graphql/interface";
import { ICategoryOutput } from "../graphql/interface/category";
import Product from "./product";

export default function ProductList() {
  const limit = 20;
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [previousActiveTab, setPreviousActiveTab] = useState<number>(0);
  const { ref, inView } = useInView({ threshold: 0 });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = useCallback((index: number) => {
    setActiveTab(index);
  }, []);

  const { data, error, fetchMore } = useSuspenseQuery<IProductOutput>(
    QueryProducts,
    {
      variables: { limit },
    },
  );

  const { data: categoriesData } =
    useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const isMobileDevice = useCallback(() => {
    const userAgent = window.navigator.userAgent;
    const isMobileDevice = Boolean(
      userAgent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
      ),
    );
    return isMobileDevice;
  }, []);

  const fetch = useCallback(async () => {
    const modifiedTab = previousActiveTab !== activeTab;
    if (!modifiedTab) {
      const lastProduct = products.at(-1);
      const searchAfter = lastProduct?.searchAfter;

      const categoryId =
        activeTab === 0
          ? undefined
          : +categoriesData.categories[activeTab - 1].id;

      const newProducts = await fetchMore({
        variables: { limit, searchAfter, categoryId },
      });

      setHasNext(newProducts.data.products.length === limit);
      setProducts([...products, ...newProducts.data.products]);
      return;
    }

    const categoryId =
      activeTab === 0
        ? undefined
        : +categoriesData.categories[activeTab - 1].id;

    const newProducts = await fetchMore({
      variables: { limit, categoryId },
    });

    setHasNext(newProducts.data.products.length === limit);
    setProducts(newProducts.data.products);
  }, [hasNext, inView, activeTab]);

  useEffect(() => {
    setIsMobile(isMobileDevice());

    const modifiedTab = previousActiveTab !== activeTab;
    if (modifiedTab) {
      fetch();
      setPreviousActiveTab(() => activeTab);
      return;
    }

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
        <Tabs
          className="react-tabs__tab-list"
          selectedIndex={activeTab}
          onSelect={handleTabChange}
          defaultFocus
        >
          <TabList>
            <Tab
              className="inline-block p-4 text-zinc-400	b-0"
              id="profile-tab"
              data-tabs-target="#profile"
              type="button"
              role="tab"
              aria-controls="profile"
              aria-selected="true"
            >
              전체
            </Tab>

            {categoriesData.categories.map((category) => (
              <Tab
                key={category.id}
                className="inline-block p-4 text-zinc-400	b-0"
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
          <div ref={ref} className="h-48 w-full" />
        </Tabs>
      )}
    </main>
  );
}
