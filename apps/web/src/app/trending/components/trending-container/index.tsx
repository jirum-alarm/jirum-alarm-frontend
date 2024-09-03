'use client';
import React, { useRef, useEffect, useState, Suspense, KeyboardEvent } from 'react';
import { IllustStandingSmall, Setting } from '@/components/common/icons';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import { cn } from '@/lib/cn';
import useTabSwitcher from '../../hooks/useTabSwitcher';
import TrendingList from '../TrendingList';
import { CategoryQueries } from '@/entities/category';
import { useSuspenseQuery } from '@tanstack/react-query';
import { PAGE } from '@/constants/page';

export const TrendingContainer = () => {
  const { swiperRef, activeTab, handleTabChange, tabRef } = useTabSwitcher();
  const {
    data: { categories },
  } = useSuspenseQuery(CategoryQueries.categoriesForUser());
  const { isHeaderVisible } = useVisibilityOnScroll();

  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);
  const tabListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const currentTab = tabsRef.current[activeTab];
    if (currentTab) {
      requestAnimationFrame(() => {
        setIndicatorStyle({
          left: currentTab.offsetLeft,
          width: currentTab.offsetWidth,
        });

        currentTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    }
  }, [activeTab]);

  const handleClickTab = (index: number) => {
    handleTabChange(index);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      const newIndex = Math.max(0, Math.min(categories.length, activeTab + direction));
      handleClickTab(newIndex);
    }
  };

  const tabClassName =
    'inline-block h-full cursor-pointer px-[6px] pb-[8px] pt-[10px] text-sm shadow-none outline-none transition-all duration-300 mouse-hover:hover:font-medium [&:not(:last-child)]:mr-2';

  return (
    <div>
      <div
        className={cn('sticky z-50 w-full max-w-screen-layout-max bg-white transition-[top]', {
          'top-[56px]': isHeaderVisible,
          'top-0': !isHeaderVisible,
        })}
      >
        <div className="relative w-full">
          <div className="w-full overflow-x-scroll scroll-smooth scrollbar-hide" ref={tabRef}>
            <ul
              className="relative whitespace-nowrap will-change-transform"
              role="tablist"
              ref={tabListRef}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <li
                ref={(el) => (tabsRef.current[0] = el)}
                onClick={() => handleClickTab(0)}
                role="tab"
                aria-selected={activeTab === 0}
                aria-controls={`panel-0`}
                className={cn(
                  tabClassName,
                  activeTab === 0 ? 'font-medium text-gray-900' : 'text-gray-600',
                )}
              >
                <Link href={`/trending?tab=${0}`} className="px-[6px] pb-[8px] pt-[10px]">
                  전체
                </Link>
              </li>
              {categories.map((category, i) => (
                <li
                  key={category.id}
                  ref={(el) => (tabsRef.current[i + 1] = el)}
                  onClick={() => handleClickTab(i + 1)}
                  role="tab"
                  aria-selected={activeTab === i + 1}
                  aria-controls={`panel-${i + 1}`}
                  className={cn(
                    tabClassName,
                    activeTab === i + 1 ? 'font-medium text-gray-900' : 'text-gray-600',
                  )}
                >
                  <Link
                    href={`${PAGE.TRENDING}?tab=${i + 1}`}
                    className="px-[6px] pb-[8px] pt-[10px]"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              <div
                className="absolute bottom-0 h-0.5 bg-primary-600 transition-all duration-300"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />
            </ul>
          </div>
          <Link
            className="absolute right-0 top-0 flex h-10 w-11 items-center justify-end bg-fade-to-white"
            href={'/mypage/categories'}
            prefetch={false}
          >
            <Setting />
          </Link>
        </div>
      </div>
      <Swiper
        onSwiper={(swiper: SwiperType) => (swiperRef.current = swiper)}
        onSlideChange={(swiper: SwiperType) => handleTabChange(swiper.realIndex)}
        initialSlide={activeTab}
        // onProgress={handleProgressSwiper}
        className="my-6"
      >
        <SwiperSlide className="h-full w-full">
          {activeTab === 0 && (
            <div>
              <Suspense fallback={<TrendingListSkeleton />}>
                <TrendingList categoryId={0} categoryName={'전체'} />
              </Suspense>
            </div>
          )}
        </SwiperSlide>
        {categories.map((category, index) => {
          const shouldRender = index + 1 === activeTab;
          return (
            <SwiperSlide key={category.id} className="h-full w-full">
              {shouldRender && (
                <div>
                  <Suspense fallback={<TrendingListSkeleton />}>
                    <TrendingList categoryId={category.id} categoryName={category.name} />
                  </Suspense>
                </div>
              )}
            </SwiperSlide>
          );
        })}
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
