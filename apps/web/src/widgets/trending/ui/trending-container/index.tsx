'use client';

import { Tabs } from 'radix-ui';
import { Suspense, useCallback, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import GridProductListSkeleton from '@/features/product-list/grid/GridProductListSkeleton';

import { TAB_META } from '@/widgets/trending/lib/tabMeta';
import { useTabSwiper } from '@/widgets/trending/model/useTabSwiper';

import TabBarV2 from '../TabbarV2';
import TrendingList from '../TrendingList';

const SWIPER_OPTIONS: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: false,
};

type Props = {
  initialTab: number;
};

export const TrendingContainer = ({ initialTab }: Props) => {
  const handleTitleChange = useCallback((tabId: number) => {
    const meta = TAB_META[tabId] || TAB_META[0];
    document.title = meta.title;
  }, []);

  const {
    tabId,
    allCategories,
    categoryIds,
    handleInitSwiper,
    handleSlideChange,
    handleTabChange,
    isFetched,
    isWithinRange,
  } = useTabSwiper({ initialTab, onTabChange: handleTitleChange });

  return (
    <Tabs.Root value={`${tabId}`} asChild>
      <div>
        <TabBarV2
          allCategories={allCategories}
          tabIndex={categoryIds.indexOf(tabId)}
          onTabClick={(id) => handleTabChange(id)}
        />

        <div className="pc:mt-7 mt-16 overflow-hidden">
          <Swiper
            {...SWIPER_OPTIONS}
            initialSlide={categoryIds.indexOf(tabId)}
            onSlideChange={handleSlideChange}
            onSwiper={handleInitSwiper}
          >
            {allCategories.map((category) => (
              <SwiperSlide key={category.id} className="w-full flex-[0_0_100%]">
                {isFetched(category.id) && isWithinRange(category.id) ? (
                  <Suspense
                    fallback={
                      <div className="px-5">
                        <GridProductListSkeleton length={20} />
                      </div>
                    }
                  >
                    <div className="overflow-x-hidden">
                      <TrendingList categoryId={category.id} categoryName={category.name} />
                    </div>
                  </Suspense>
                ) : (
                  <div className="px-5">
                    <GridProductListSkeleton length={20} />
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </Tabs.Root>
  );
};
