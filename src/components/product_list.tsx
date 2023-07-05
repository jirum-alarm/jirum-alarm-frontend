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
  const allCategory = { id: 0, name: "전체" };
  const [showSearchBox, setShowSearchBox] = useState<boolean>(true);
  const [previousKeyword, setPreviousKeyword] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
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

  const handleKeyword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(event.target.value);
    },
    [],
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
    if (keyword) {
      const modifiedKeyword = previousKeyword !== keyword && keyword !== "";
      if (modifiedKeyword) {
        const newProducts = await fetchMore({
          variables: { limit, keyword },
        });

        setHasNext(newProducts.data.products.length === limit);
        setProducts(newProducts.data.products);
        return;
      }

      const lastProduct = products.at(-1);
      const searchAfter = lastProduct?.searchAfter;
      const newProducts = await fetchMore({
        variables: { limit, searchAfter, keyword },
      });

      setHasNext(newProducts.data.products.length === limit);
      setProducts([...products, ...newProducts.data.products]);
      return;
    }

    const categories = [allCategory, ...categoriesData.categories];
    const categoryId =
      activeTab === 0 ? undefined : Number(categories[activeTab].id);

    const modifiedTab = previousActiveTab !== activeTab;
    if (!modifiedTab) {
      const isRemovedKeyword = previousKeyword !== keyword && keyword === "";
      const lastProduct = products.at(-1);
      const searchAfter = lastProduct?.searchAfter;

      let newProducts;

      if (isRemovedKeyword) {
        newProducts = await fetchMore({
          variables: { limit, categoryId },
        });
      } else {
        newProducts = await fetchMore({
          variables: { limit, searchAfter, categoryId },
        });
      }

      if (isRemovedKeyword) {
        setHasNext(newProducts.data.products.length === limit);
        setProducts(newProducts.data.products);
        return;
      }

      setHasNext(newProducts.data.products.length === limit);
      setProducts([...products, ...newProducts.data.products]);
      return;
    }

    const newProducts = await fetchMore({
      variables: { limit, categoryId },
    });

    setHasNext(newProducts.data.products.length === limit);
    setProducts(newProducts.data.products);
  }, [hasNext, inView, activeTab, keyword]);

  useEffect(() => {
    setIsMobile(isMobileDevice());

    const modifiedTab = previousActiveTab !== activeTab;
    console.log("modifiedTab");
    if (modifiedTab) {
      setKeyword("");
      setPreviousKeyword("");
    }

    if (keyword) {
      console.log("-키워드로 검색-");
      fetch();
      setPreviousKeyword(() => keyword);
      return;
    }

    const isRemovedKeyword = previousKeyword !== keyword && keyword === "";
    if (isRemovedKeyword) {
      setProducts([]);
      setHasNext(true);
    }

    if (isRemovedKeyword || modifiedTab) {
      console.log("-탭으로 검색-");
      fetch();
      setPreviousActiveTab(() => activeTab);
      setPreviousKeyword(() => keyword);
      return;
    }

    if (inView && hasNext) {
      console.log("-추가 로딩-");
      fetch();
    }
  }, [inView, hasNext, activeTab, keyword]);

  return (
    <main>
      <div
        className={`mb-8 drop-shadow-md ${showSearchBox ? "block" : "hidden"}`}
      >
        <div className="relative flex items-center w-full h-14 rounded-lg shadow focus-within:shadow-md bg-white overflow-hidden">
          <div className="grid place-items-center h-full w-14 text-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
            type="text"
            id="search"
            placeholder="최근에 구매하고 싶은 제품이 있으셨나요?"
            onChange={handleKeyword}
          />

          <div
            className="grid place-items-center h-full w-14 text-gray-300 cursor-pointer"
            onClick={() => setShowSearchBox(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>
      </div>

      {error ? (
        <p>게시글을 불러오지 못했습니다.</p>
      ) : !data ? (
        <p>로딩중....</p>
      ) : (
        <Tabs
          className="react-tabs__tab-list"
          forceRenderTabPanel
          selectedIndex={activeTab}
          onSelect={handleTabChange}
          defaultFocus
          disableUpDownKeys
        >
          <TabList
            className={`will-change-transform scroll-smooth overflow-x-scroll ${
              isMobile ? "whitespace-nowrap" : ""
            }`}
          >
            {[allCategory, ...categoriesData.categories].map((category) => (
              <Tab
                key={category.id}
                className="inline-block p-2 text-zinc-400	font-bold b-0"
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
            className="will-change-transform my-6"
          >
            {[allCategory, ...categoriesData.categories].map((category) => (
              <TabPanel key={category.id}>
                <div className="flex">
                  <div className="item-center grid grid-cols-1 gap-8 sm:grid-cols-2">
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
