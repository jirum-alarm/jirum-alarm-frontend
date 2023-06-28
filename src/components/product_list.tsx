"use client";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import SwipeableViews from "react-swipeable-views";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";

import { QueryProducts } from "../graphql";
import { IProduct, IProductOutput } from "../graphql/interface";
import Product from "./product";

import "react-tabs/style/react-tabs.css";
import { QueryCategories } from "../graphql/category";
import { ICategoryOutput } from "../graphql/interface/category";

export default function ProductList() {
  const limit = 100;
  const [isMobile, setIsMobile] = useState(false);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<
    Record<string, IProduct[]>
  >({});
  const [hasNext, setHasNext] = useState<boolean>(true);
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
    if (hasNext) {
      const lastProduct = products.at(-1);
      const searchAfter = lastProduct?.searchAfter;
      const newProducts = await fetchMore({
        variables: { limit, searchAfter },
      });
      setHasNext(newProducts.data.products.length !== 0);
      setProducts([...products, ...newProducts.data.products]);
    }
  }, [fetchMore, products, hasNext]);

  useEffect(() => {
    setIsMobile(isMobileDevice());

    if (inView && hasNext) {
      fetch();
    }
  }, [inView]);

  return (
    <main>
      {error ? (
        <p>게시글을 불러오지 못했습니다.</p>
      ) : !data ? (
        <p>로딩중....</p>
      ) : (
        <div>
          <div>
            <Tabs selectedIndex={activeTab} onSelect={handleTabChange}>
              <TabList>
                <Tab>
                  <button
                    className="inline-block p-4 border-b-2 rounded-t-lg"
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
                      className="inline-block p-4 border-b-2 rounded-t-lg"
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
                        {products
                          .filter(
                            (product) => product.categoryId === +category.id,
                          )
                          .map((product) => (
                            <Product
                              key={product.id}
                              product={product}
                            ></Product>
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
