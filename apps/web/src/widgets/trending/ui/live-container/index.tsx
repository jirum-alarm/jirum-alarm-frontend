'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { Tabs } from 'radix-ui';
import {
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { CategoryQueries } from '@entities/category';

import GridProductListSkeleton from '@features/product-list/grid/GridProductListSkeleton';

import LiveList from '../LiveList';
import TabBarV2 from '../TabbarV2';

const SWIPER_OPTIONS: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: false,
};

type Props = {
  initialTab: number;
};

export const LiveContainer = ({ initialTab }: Props) => {
  const swiperRef = useRef<SwiperClass>(null);

  const {
    data: { categories },
  } = useSuspenseQuery(CategoryQueries.categoriesForUser());

  const allCategories = useMemo(() => [{ id: 0, name: '전체' }, ...categories], [categories]);
  const categoryIds = useMemo(() => allCategories.map((c) => c.id), [allCategories]);

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
    if (typeof newId === 'number') {
      if (newId !== tabId) {
        startTransition(() => {
          setTabId(newId);
        });
      }
      setFetchedTabIds((prev) => {
        if (prev.has(newId)) return prev;
        const next = new Set(prev);
        next.add(newId);
        return next;
      });
    }
  };

  const handleTabChange = useCallback(
    (nextId: number) => {
      if (nextId === tabId) return;
      setTabId(nextId);
      window.scrollTo(0, 0);
    },
    [tabId, setTabId],
  );

  useEffect(() => {
    document.title = '실시간 핫딜 | 지름알림';
  }, []);

  useEffect(() => {
    const swiper = swiperRef.current;
    const targetIndex = categoryIds.indexOf(tabId);
    if (swiper && targetIndex >= 0 && targetIndex !== swiper.activeIndex) {
      swiper.slideTo(targetIndex);
    }
    setFetchedTabIds((prev) => {
      if (prev.has(tabId)) return prev;
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }, [tabId, categoryIds]);

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
            {allCategories.map((category) => {
              const isFetched = fetchedTabIds.has(category.id);
              const currentIndex = categoryIds.indexOf(category.id);
              const activeIndex = categoryIds.indexOf(tabId);
              const isWithinRange = Math.abs(currentIndex - activeIndex) <= 1;
              return (
                <SwiperSlide key={category.id} className="w-full flex-[0_0_100%]">
                  {isFetched && isWithinRange ? (
                    <Suspense
                      fallback={
                        <div className="px-5">
                          <GridProductListSkeleton length={20} />
                        </div>
                      }
                    >
                      <div className="overflow-x-hidden">
                        <LiveList categoryId={category.id === 0 ? null : category.id} />
                      </div>
                    </Suspense>
                  ) : (
                    <div className="px-5">
                      <GridProductListSkeleton length={20} />
                    </div>
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
