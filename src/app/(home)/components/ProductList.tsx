'use client';
import { QueryProducts } from '@/graphql';
import { QueryCategories } from '@/graphql/category';
import { IProductOutput } from '@/graphql/interface';
import { ICategoryOutput } from '@/graphql/interface/category';
import { useSuspenseQuery } from '@apollo/client';
import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRouter, useSearchParams } from 'next/navigation';
import { TopButton } from '@/components/TopButton';
import dynamic from 'next/dynamic';
import { IProductsFilterParam } from '@/types/main';
import SwipeableViews from 'react-swipeable-views';
import { useDevice } from '@/hooks/useDevice';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../../../style/React_tabs.css';
import ProductNotFound from './ProductNotFound';
import ProductLoading from './ProductLoading';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';

const ProductCard = dynamic(() => import('./ProductCard'), { ssr: false });
const ProductList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const limit = 20;
  const allCategory = { id: 0, name: '전체' };
  const [inputData, setInputData] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  const [hasNextData, setHasNextData] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { isMobile } = useDevice();
  const categoryParam = searchParams.get('categoryId');
  const keywordParam = searchParams.get('keyword');

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const {
    data: { products } = {},
    refetch,
    fetchMore,
  } = useQuery<IProductOutput>(QueryProducts, {
    variables: {
      limit,
      keyword: keywordParam || undefined,
      categoryId: categoryParam ? Number(categoryParam) : undefined,
    },
  });

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextData) {
        fetchMoreProducts();
      }
    },
  });

  const handleTabChange = useCallback((index: number) => {
    if (index > 0) {
      router.push(`/?categoryId=${index - 1}`);
    } else {
      router.push('/');
    }
  }, []);

  const keywordHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputData(event.target.value);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      searchHandler();
    }
  };

  const searchHandler = () => {
    setKeyword(inputData);
  };
  const handleClose = useCallback(() => {
    setKeyword(() => '');
    setInputData(() => '');
  }, []);

  const fetchMoreProducts = () => {
    const searchAfter = products?.at(-1)?.searchAfter;
    fetchMore({
      variables: {
        searchAfter,
      },
      updateQuery: ({ products }, { fetchMoreResult }) => {
        if (fetchMoreResult.products.length < limit) {
          setHasNextData(false);
        }
        return { products: [...products, ...fetchMoreResult.products] };
      },
    });
  };

  useEffect(() => {
    const categoryParam = searchParams.get('categoryId');
    const keywordParam = searchParams.get('keyword');
    if (!categoryParam && !keywordParam) {
      setIsLoading(false);
      setActiveTab(0);
      setKeyword('');
      setInputData('');
      return;
    }
    if (categoryParam) {
      setActiveTab(Number(categoryParam));
    }
    if (keywordParam) {
      setKeyword(keywordParam);
      setInputData(keywordParam);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (products && products.length % limit !== 0) {
      setHasNextData(false);
    }
  }, [products]);

  useEffect(() => {
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      setActiveTab(Number(categoryId) + 1);
    } else {
      setActiveTab(0);
    }
  }, [searchParams]);

  useEffect(() => {
    setHasNextData(true);

    const params: IProductsFilterParam = {
      limit,
      keyword: keyword || undefined,
      categoryId: activeTab - 1 > -1 ? activeTab - 1 : undefined,
      searchAfter: undefined,
    };

    refetch(params);
  }, [keyword, activeTab]);

  return (
    <main>
      {isLoading ? (
        <div>
          <ProductLoading />
        </div>
      ) : (
        <>
          <div className="mb-6 drop-shadow-md">
            <div className="mt-6 relative flex items-center w-full h-14 rounded-lg shadow hover:shadow-md bg-white overflow-hidden">
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
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
                onKeyDown={onKeyDown}
                onChange={keywordHandler}
                value={inputData}
                spellCheck={false}
                placeholder="최근에 구매하고 싶은 제품이 있으셨나요?"
              />

              <div
                className="grid place-items-center h-full w-14 text-gray-300 cursor-pointer"
                onClick={handleClose}
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          </div>
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
                isMobile ? 'whitespace-nowrap' : ''
              }`}
            >
              {[allCategory].concat(categoriesData.categories).map((category) => (
                <Tab
                  key={category.id}
                  className="hover:text-zinc-700 transition duration-200 inline-block p-2 text-zinc-400 font-bold b-0"
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

            <div className="flex">
              <SwipeableViews
                index={activeTab}
                onChangeIndex={handleTabChange}
                animateTransitions={isMobile}
                className="will-change-transform my-6"
              >
                {[allCategory].concat(categoriesData.categories).map((category) => (
                  <TabPanel key={category.id}>
                    {products?.length === 0 ? (
                      <div className="flex min-h-[500px]">
                        <ProductNotFound />
                      </div>
                    ) : (
                      <div className="fex min-h-[500px]">
                        <div className=" item-center grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                          {products?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                          ))}
                        </div>
                      </div>
                    )}
                  </TabPanel>
                ))}
              </SwipeableViews>
            </div>
            <TopButton />
            {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
          </Tabs>
        </>
      )}
    </main>
  );
};

export default ProductList;
