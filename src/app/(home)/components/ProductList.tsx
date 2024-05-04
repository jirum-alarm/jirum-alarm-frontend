'use client';
import { TopButton } from '@/components/TopButton';
import SwipeableViews from 'react-swipeable-views';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import '../../../style/React_tabs.css';
import ProductNotFound from './ProductNotFound';
import ProductLoading from './ProductLoading';
import ProductCard from './ProductCard';
import SearchInput from './SearchInput';
import { useProductListViewModel } from '../hooks/useProductListViewModel';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import useScreenSize from '@/hooks/useScreenSize';

const ProductList = () => {
  const {
    loading,
    activeTab,
    handleTabChange,
    isMobile,
    allCategory,
    products,
    hotDeals,
    categoriesData,
    hasNextData,
    ref,
  } = useProductListViewModel();

  const { lg, md, sm } = useScreenSize();

  const firstRenderingCount = lg ? 15 : md ? 12 : sm ? 9 : 6;

  return (
    <main>
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
          {loading ? (
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

                  if (category.id === 0) {
                    return (
                      <TabPanel key={key}>
                        {products?.length === 0 ? (
                          <div className="flex min-h-[500px]">
                            <ProductNotFound />
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
                              {products
                                ?.slice(0, firstRenderingCount)
                                .map((product, i) => (
                                  <ProductImageCard key={i} product={product} />
                                ))}
                            </div>
                            <div className="pb-4 pt-9">
                              <span className=" text-lg font-semibold text-gray-900">
                                오늘 가장 인기있는 핫딜
                              </span>
                            </div>
                            <div className="pb-11">
                              <Swiper
                                spaceBetween={12}
                                slidesPerView={3}
                                breakpoints={{
                                  768: { slidesPerView: 4 },
                                  1024: { slidesPerView: 5 },
                                }}
                              >
                                {hotDeals?.map((hotDeal, i) => (
                                  <SwiperSlide key={i}>
                                    <ProductImageCard product={hotDeal} type="hotDeal" />
                                  </SwiperSlide>
                                ))}
                              </Swiper>
                            </div>
                            <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
                              {products
                                ?.slice(firstRenderingCount)
                                .map((product, i) => (
                                  <ProductImageCard key={i} product={product} />
                                ))}
                            </div>
                          </>
                        )}
                      </TabPanel>
                    );
                  }

                  return (
                    <React.Fragment key={key}>
                      <TabPanel>
                        {products?.length === 0 ? (
                          <div className="flex min-h-[500px]">
                            <ProductNotFound />
                          </div>
                        ) : (
                          <div className="min-h-[500px]">
                            <div className="item-center grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                              {products?.map((product, i) => (
                                <ProductCard key={i} product={product} />
                              ))}
                            </div>
                          </div>
                        )}
                      </TabPanel>
                    </React.Fragment>
                  );
                })}
              </SwipeableViews>
            </div>
          )}

          <TopButton />
          {hasNextData && <div ref={ref} className="h-[48px] w-full" />}
        </Tabs>
      </>
    </main>
  );
};

export default ProductList;

function ProductImageCard({
  product,
  type = 'product',
}: {
  product: IProduct;
  type?: 'product' | 'hotDeal';
}) {
  return (
    <a
      href={product.url}
      className={cn({
        'w-[162px]': type === 'product',
        'w-[120px]': type === 'hotDeal',
      })}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div
        className={cn({
          'relative overflow-hidden rounded-lg': true,
          'h-[162px]': type === 'product',
          'h-[120px]': type === 'hotDeal',
        })}
      >
        {type === 'product' && (
          <div
            className={cn({
              'text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs':
                true,
              'bg-error-500 px-3 text-white ': product.isHot,
              'border border-gray-400 bg-white px-2 text-gray-500': product.isEnd,
            })}
          >
            {product.isHot ? '핫딜' : product.isEnd ? '판매종료' : ''}
          </div>
        )}
        {product?.thumbnail ? (
          <Image src={product?.thumbnail} width={162} height={162} alt={product.title} />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <span className="text-center text-sm text-gray-300">
              상품 이미지
              <br />
              준비중입니다
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="pt-2 text-sm text-gray-700">{product.title}</span>
        <span className="align-center flex h-8 pt-1 text-lg font-semibold text-gray-900">
          {product?.price ?? ''}
        </span>
      </div>
    </a>
  );
}
