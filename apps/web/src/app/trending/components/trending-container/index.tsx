'use client';
import { Tab, TabList, Tabs } from 'react-tabs';
import { IllustStandingSmall, Setting } from '@/components/common/icons';
import Link from 'next/link';
import { Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import { cn } from '@/lib/cn';
import useTabSwitcher from '../../hooks/useTabSwitcher';
import TrendingList from '../TrendingList';
import { CategoryQueries } from '@/entities/category';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PAGE } from '@/constants/page';

export const TrendingContainer = () => {
  const { swiperRef, activeTab, handleTabChange, handleClickTab, tabRef } = useTabSwitcher();
  const {
    data: { categories },
  } = useSuspenseQuery(CategoryQueries.categoriesForUser());
  const { isHeaderVisible } = useVisibilityOnScroll();

  return (
    <div>
      <div
        className={cn('sticky z-50 w-full max-w-screen-layout-max bg-white transition-[top]', {
          'top-[56px]': isHeaderVisible,
          'top-0': !isHeaderVisible,
        })}
      >
        <Tabs selectedIndex={activeTab} onSelect={handleTabChange} defaultFocus disableUpDownKeys>
          <div className="relative w-full">
            <div className="w-full overflow-x-scroll scroll-smooth scrollbar-hide" ref={tabRef}>
              <TabList className={`whitespace-nowrap will-change-transform`}>
                <Tab
                  onClick={handleClickTab}
                  className="inline-block h-full cursor-pointer border-b-2 border-b-transparent px-[6px] pb-[8px] pt-[10px] text-sm text-gray-600 shadow-none outline-none transition-all transition-none duration-300 mouse-hover:hover:font-medium mouse-hover:hover:text-gray-900 [&:not(:last-child)]:mr-2"
                  selectedClassName="!border-b-primary-600 text-gray-900 font-medium"
                >
                  <Link href={`/trending?tab=${0}`} className="px-[6px] pb-[8px] pt-[10px]">
                    전체
                  </Link>
                </Tab>
                {categories.map((category, i) => (
                  <Tab
                    key={category.id}
                    onClick={handleClickTab}
                    className="inline-block h-full cursor-pointer border-b-2 border-b-transparent px-[6px] pb-[8px] pt-[10px] text-sm text-gray-600 shadow-none outline-none transition-all transition-none duration-300 mouse-hover:hover:font-medium mouse-hover:hover:text-gray-900 [&:not(:last-child)]:mr-2"
                    selectedClassName="!border-b-primary-600 text-gray-900 font-medium"
                  >
                    <Link
                      href={`${PAGE.TRENDING}?tab=${i + 1}`}
                      className="px-[6px] pb-[8px] pt-[10px]"
                    >
                      {category.name}
                    </Link>
                  </Tab>
                ))}
              </TabList>
            </div>
            <Link
              className="absolute right-0 top-0 flex h-10 w-11 items-center justify-end bg-fade-to-white"
              href={'/mypage/categories'}
              prefetch={false}
            >
              <Setting />
            </Link>
          </div>
        </Tabs>
      </div>
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => handleTabChange(swiper.realIndex)}
        initialSlide={activeTab}
        // onProgress={handleProgressSwiper}
        className="my-6"
      >
        <SwiperSlide className="h-full w-full">
          {0 === activeTab && (
            <div>
              <Suspense fallback={<TrendingListSkeleton />}>
                <TrendingList categoryId={0} categoryName={'전체'} />
              </Suspense>
            </div>
          )}
        </SwiperSlide>
        {categories.map((category, index) => (
          <SwiperSlide key={category.id} className="h-full w-full">
            {index + 1 === activeTab && (
              <div>
                <Suspense fallback={<TrendingListSkeleton />}>
                  <TrendingList categoryId={category.id} categoryName={category.name} />
                </Suspense>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

const TrendingListSkeleton = () => {
  return (
    <div className="grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
      {Array.from({ length: 12 }).map((item, i) => (
        <div key={i} className="w-full">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
            <IllustStandingSmall />
          </div>
          <div className="flex flex-col gap-1 pt-2">
            <div className="h-3 bg-gray-100"></div>
            <div className="h-3 w-1/2 bg-gray-100"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
