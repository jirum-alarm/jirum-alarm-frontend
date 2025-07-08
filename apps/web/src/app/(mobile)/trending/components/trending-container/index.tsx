'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Tabs } from 'radix-ui';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { CategoryQueries } from '@/entities/category';
import GridProductListSkeleton from '@/features/products/components/skeleton/GridProductListSkeleton';

import { TAB_META } from '../../tabMeta';
import TabBar from '../Tabbar';
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
  const swiperRef = useRef<SwiperClass>(null);

  const {
    data: { categories },
  } = useSuspenseQuery(CategoryQueries.categoriesForUser());

  const allCategories = useMemo(() => [{ id: 0, name: '전체' }, ...categories], [categories]);
  const categoryIds = allCategories.map((c) => c.id);

  const [tabId, setTabId] = useQueryState('tab', {
    defaultValue: initialTab,
    parse: (value) => {
      const parsed = Number(value);
      if (isNaN(parsed)) return 0;
      if (!categoryIds.includes(parsed)) return 0;
      return parsed;
    },
    serialize: String,
    history: 'push',
    clearOnDefault: false,
  });

  const [fetchedTabIds, setFetchedTabIds] = useState<Set<number>>(new Set([initialTab]));

  const handleInitSwiper = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
  };

  const handleSlideChange = (swiper: SwiperClass) => {
    const index = swiper.activeIndex;
    const newId = allCategories[index]?.id;
    if (typeof newId === 'number' && newId !== tabId) {
      setTabId(newId);
      setFetchedTabIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(newId);
        return newSet;
      });
    }
  };

  const handleTabChange = useCallback(
    (nextId: number) => {
      if (nextId === tabId) return;
      swiperRef.current?.slideTo(categoryIds.indexOf(nextId));
    },
    [categoryIds, tabId],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const meta = TAB_META[tabId] || TAB_META[0];
    document.title = meta.title;
    setFetchedTabIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(tabId);
      return newSet;
    });
  }, [tabId]);

  return (
    <Tabs.Root value={`${tabId}`} asChild>
      <div className="relative">
        <TabBar
          allCategories={allCategories}
          tabIndex={categoryIds.indexOf(tabId)}
          onTabClick={(id) => handleTabChange(id)}
        />

        <div className="mt-[72px] overflow-hidden">
          <Swiper
            {...SWIPER_OPTIONS}
            initialSlide={tabId}
            onSlideChange={handleSlideChange}
            onSwiper={handleInitSwiper}
          >
            {allCategories.map((category) => {
              const isFetched = fetchedTabIds.has(category.id);
              return (
                <SwiperSlide key={category.id} className="w-full flex-[0_0_100%] px-5">
                  {isFetched ? (
                    <ApiErrorBoundary>
                      <Suspense fallback={<GridProductListSkeleton length={12} />}>
                        <TrendingList categoryId={category.id} categoryName={category.name} />
                      </Suspense>
                    </ApiErrorBoundary>
                  ) : (
                    <GridProductListSkeleton length={12} />
                  )}
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </Tabs.Root>
  );
};
