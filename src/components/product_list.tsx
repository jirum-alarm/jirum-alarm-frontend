"use client";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import SwipeableViews from "react-swipeable-views";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import { QueryProducts } from "../graphql";
import { IProduct, IProductOutput } from "../interface";
import isMobile from "../lib/is-mobile";
import Product from "./product";

export default function ProductList() {
  const limit = 20;
  const [products, setProducts] = useState<IProduct[]>([]);
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

  const fetch = useCallback(async () => {
    if (hasNext) {
      const lastProduct = products.at(-1);
      const searchAfter = lastProduct?.searchAfter;
      const newProducts = await fetchMore({
        variables: { limit, searchAfter },
      });
      setHasNext(newProducts.data.products.length === limit);
      setProducts([...products, ...newProducts.data.products]);
    }
  }, [fetchMore, products, hasNext]);

  useEffect(() => {
    if (inView && hasNext) {
      fetch();
    }
  }, [inView, hasNext]);

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
                    PC
                  </button>
                </Tab>
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
                    디지털
                  </button>
                </Tab>
              </TabList>

              <SwipeableViews
                index={activeTab}
                onChangeIndex={handleTabChange}
                animateTransitions={!isMobile}
              >
                <TabPanel>
                  <div className="flex">
                    <div>tab1</div>
                    <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
                      {products.map((product) => (
                        <Product key={product.id} product={product}></Product>
                      ))}
                    </div>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className="flex">
                    <div>tab2</div>
                    <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
                      {products.map((product) => (
                        <Product key={product.id} product={product}></Product>
                      ))}
                    </div>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className="flex">
                    <div>tab3</div>
                    <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
                      {products.map((product) => (
                        <Product key={product.id} product={product}></Product>
                      ))}
                    </div>
                  </div>
                </TabPanel>
              </SwipeableViews>
            </Tabs>
          </div>
        </div>
      )}
      <div ref={ref} className="h-48 w-full" />
    </main>
  );
}
