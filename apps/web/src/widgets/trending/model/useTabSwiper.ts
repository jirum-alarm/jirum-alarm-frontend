'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SwiperClass } from 'swiper/react';

import { CategoryQueries } from '@entities/category';

export type CategoryItem = {
  id: number;
  name: string;
};

type UseTabSwiperOptions = {
  initialTab: number;
  onTabChange?: (tabId: number) => void;
};

export function useTabSwiper({ initialTab, onTabChange }: UseTabSwiperOptions) {
  const swiperRef = useRef<SwiperClass>(null);

  const {
    data: { categories },
  } = useSuspenseQuery(CategoryQueries.categoriesForUser());

  const allCategories = useMemo<CategoryItem[]>(
    () => [{ id: 0, name: '전체' }, ...categories],
    [categories],
  );
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

  const handleInitSwiper = useCallback((swiper: SwiperClass) => {
    swiperRef.current = swiper;
  }, []);

  const handleSlideChange = useCallback(
    (swiper: SwiperClass) => {
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
    },
    [allCategories, tabId, setTabId],
  );

  const handleTabChange = useCallback(
    (nextId: number) => {
      if (nextId === tabId) return;
      setTabId(nextId);
      window.scrollTo(0, 0);
    },
    [tabId, setTabId],
  );

  // Swiper sync effect
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

  // Title update callback
  useEffect(() => {
    onTabChange?.(tabId);
  }, [tabId, onTabChange]);

  const isFetched = useCallback(
    (categoryId: number) => fetchedTabIds.has(categoryId),
    [fetchedTabIds],
  );

  const isWithinRange = useCallback(
    (categoryId: number) => {
      const currentIndex = categoryIds.indexOf(categoryId);
      const activeIndex = categoryIds.indexOf(tabId);
      return Math.abs(currentIndex - activeIndex) <= 1;
    },
    [categoryIds, tabId],
  );

  return {
    swiperRef,
    tabId,
    allCategories,
    categoryIds,
    handleInitSwiper,
    handleSlideChange,
    handleTabChange,
    isFetched,
    isWithinRange,
  };
}
