'use client';
import { QueryProducts } from '@/graphql';
import { QueryCategories } from '@/graphql/category';
import { IProductOutput } from '@/graphql/interface';
import { ICategoryOutput } from '@/graphql/interface/category';
import { useSuspenseQuery } from '@apollo/client';
import React, { KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { type ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation';
import { TopButton } from '@/components/TopButton';
import { IProductsFilterParam } from '@/types/main';
import SwipeableViews from 'react-swipeable-views';
import { useDevice } from '@/hooks/useDevice';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../../../style/React_tabs.css';
import ProductNotFound from './ProductNotFound';
import ProductLoading from './ProductLoading';
import { useQuery } from '@apollo/experimental-nextjs-app-support/ssr';
import ProductCard from './ProductCard';
import SearchInput from './SearchInput';

const limit = 20;
const allCategory = { id: 0, name: '전체' };

const ProductList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [hasNextData, setHasNextData] = useState(true);
  const { isMobile } = useDevice();
  const categoryParam = searchParams.get('categoryId');
  const keywordParam = searchParams.get('keyword');
  const activeTab = categoryParam ? Number(categoryParam) + 1 : 0;

  const { data: categoriesData } = useSuspenseQuery<ICategoryOutput>(QueryCategories);

  const {
    data: { products } = {},
    fetchMore,
    loading,
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
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    if (index > 0) {
      current.set('categoryId', String(index - 1));
    } else {
      current.delete('categoryId');
    }
    const search = current.toString();
    console.log('search : ', search);
    router.push(`/?${search}`);
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
    if (products && products.length % limit !== 0) {
      setHasNextData(false);
    }
  }, [products]);

  useEffect(() => {
    setHasNextData(true);
  }, [keywordParam, categoryParam]);

  return (
    <main>
      {loading ? (
        <div>
          <ProductLoading />
        </div>
      ) : (
        <>
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
              className={`will-change-transform scroll-smooth overflow-x-scroll ${
                isMobile ? 'whitespace-nowrap' : ''
              }`}
            >
              {[allCategory].concat(categoriesData.categories).map((category) => (
                <React.Fragment key={category.name}>
                  <Tab
                    className="hover:text-zinc-700 transition duration-200 inline-block p-2 text-zinc-400 font-bold b-0"
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

            <div className="flex">
              <SwipeableViews
                index={activeTab}
                onChangeIndex={handleTabChange}
                animateTransitions={isMobile}
                className="will-change-transform my-6"
              >
                {[allCategory].concat(categoriesData.categories).map((category, i) => (
                  <React.Fragment key={`${category.id}_${i}`}>
                    <TabPanel>
                      {products?.length === 0 ? (
                        <div className="flex min-h-[500px]">
                          <ProductNotFound />
                        </div>
                      ) : (
                        <div className="fex min-h-[500px]">
                          <div className=" item-center grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                            {products?.map((product, i) => (
                              <ProductCard key={i} product={product} />
                            ))}
                          </div>
                        </div>
                      )}
                    </TabPanel>
                  </React.Fragment>
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
