'use client';
import { Tab, TabList, Tabs } from 'react-tabs';
import useTabSwitcher from '../hooks/useTabSwitcher';
import { IllustStandingSmall, Setting } from '@/components/common/icons';
import Link from 'next/link';
import TrendingList from './TrendingList';
import { Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import { cn } from '@/lib/cn';

const TrendingContainer = ({
  categories,
}: {
  categories: { id: number | null; name: string }[];
}) => {
  const {
    swiperRef,
    targetIndex,
    handleProgressSwiper,
    activeTab,
    handleTabChange,
    handleClickTab,
    tabRef,
  } = useTabSwitcher();

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
                {categories.map((category) => (
                  <Tab
                    onClick={handleClickTab}
                    key={category.id}
                    className="inline-block cursor-pointer border-b-2 border-b-transparent px-[6px] pb-[8px] pt-[10px] text-sm text-gray-600 shadow-none outline-none transition-all transition-none duration-300 mouse-hover:hover:font-medium mouse-hover:hover:text-gray-900 [&:not(:last-child)]:mr-2"
                    selectedClassName="!border-b-primary-600 text-gray-900 font-medium"
                  >
                    {category.name}
                  </Tab>
                ))}
              </TabList>
            </div>
            <Link
              className="absolute right-0 top-0 flex h-10 w-11 items-center justify-end bg-fade-to-white"
              href={'/mypage/categories'}
            >
              <Setting />
            </Link>
          </div>
        </Tabs>
      </div>
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={(swiper) => handleTabChange(swiper.realIndex)}
        onProgress={handleProgressSwiper}
        className="my-6"
      >
        {categories.map((category, index) => (
          <SwiperSlide key={category.id} className="h-full w-full">
            <Suspense fallback={<TrendingListSkeleton />}>
              <TrendingList
                categoryId={category.id}
                categoryName={category.name}
                isActive={index === targetIndex || index === activeTab}
              />
            </Suspense>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default TrendingContainer;

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
