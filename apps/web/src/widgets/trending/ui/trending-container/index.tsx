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

import { cn } from '@/shared/lib/cn';

import { CategoryQueries } from '@/entities/category';
import ProductGridListSkeleton from '@/entities/product-list/ui/grid/ProductGridListSkeleton';

import { TAB_META } from '../../lib/tabMeta';
import TabBarV2 from '../TabbarV2';
import TrendingList from '../TrendingList';

const SWIPER_OPTIONS: SwiperOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: false,
  autoHeight: true,
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

  // Split useEffect for better performance - title updates
  useEffect(() => {
    const meta = TAB_META[tabId] || TAB_META[0];
    document.title = meta.title;
  }, [tabId]);

  // Split useEffect for better performance - swiper and fetch logic
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

  // ponytail: indexOf가 -1이면 어떤 탭도 active로 안 걸려 탭바가 통째로 회색이 되고,
  // TabbarV2의 children[-1]이 undefined라 스트립 스크롤도 안 잡힌다.
  // tabId가 목록에 없는 창(로그인 상태 변화·선호 카테고리 수정으로 categoryIds가 줄어들 때
  // nuqs parse가 옛 클로저로 이미 통과시킨 값)에 대비해 0('전체')으로 떨어뜨린다.
  const activeIndex = Math.max(0, categoryIds.indexOf(tabId));

  return (
    <Tabs.Root value={`${tabId}`} asChild>
      <div>
        <TabBarV2
          allCategories={allCategories}
          tabIndex={activeIndex}
          onTabClick={(id) => handleTabChange(id)}
        />

        <div
          // ponytail: 헤더 높이만큼의 여백은 **고정**이다.
          // 예전엔 스크롤 방향에 따라 mt-[60px] ↔ mt-1 로 접었는데, 헤더 자리는 이미
          // BasicLayout 의 pt-14(56px)가 잡고 있어 같은 값을 두 곳에서 관리하는 꼴이었다.
          // 둘이 어긋나는 순간이 곧 흔들림이다 — 상세로 가면 스크롤이 0 이 되어 살아있는
          // 이 컨테이너가 60px 로 폈다가, 뒤로 오면 복원된 스크롤(2000)을 보고 4px 로
          // 되돌리며 화면 전체가 56px 왕복했다. 접힘 UX 대신 안정성을 택한다.
          className={cn('pc:mt-7 overflow-hidden', 'mt-[60px]')}
        >
          <Swiper
            {...SWIPER_OPTIONS}
            initialSlide={activeIndex}
            onSlideChange={handleSlideChange}
            onSwiper={handleInitSwiper}
          >
            {allCategories.map((category) => {
              const isFetched = fetchedTabIds.has(category.id);
              const currentIndex = categoryIds.indexOf(category.id);
              const isWithinRange = Math.abs(currentIndex - activeIndex) <= 1;
              return (
                <SwiperSlide key={category.id} className="w-full flex-[0_0_100%]">
                  {isFetched && isWithinRange ? (
                    <Suspense
                      fallback={
                        <div className="px-5">
                          <ProductGridListSkeleton length={20} />
                        </div>
                      }
                    >
                      <div className="overflow-x-hidden">
                        <TrendingList categoryId={category.id} categoryName={category.name} />
                      </div>
                    </Suspense>
                  ) : (
                    <div className="px-5">
                      <ProductGridListSkeleton length={20} />
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
