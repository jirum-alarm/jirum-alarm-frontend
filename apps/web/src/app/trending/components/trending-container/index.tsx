'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import { animate, motion, useMotionValue, useSpring } from 'motion/react';
import { useQueryState } from 'nuqs';
import { Tabs } from 'radix-ui';
import {
  useCallback,
  Suspense,
  useEffect,
  useRef,
  useMemo,
  useState,
  useTransition,
  createContext,
} from 'react';

import { IllustStandingSmall, Setting } from '@/components/common/icons';
import { CategoryQueries } from '@/entities/category';
import Link from '@/features/Link';
import useVisibilityOnScroll from '@/hooks/useVisibilityOnScroll';
import { cn } from '@/lib/cn';

import TrendingList from '../TrendingList';

type WatchDragContextType = {
  setWatchDrag: (watchDrag: boolean) => void;
};

export const WatchDragContext = createContext<WatchDragContextType>({
  setWatchDrag: () => {},
});

export const TrendingContainer = () => {
  const [watchDrag, setWatchDrag] = useState(true);

  const [emblaRef, embla] = useEmblaCarousel({
    containScroll: 'trimSnaps',
    loop: false,
    align: 'center',
    slidesToScroll: 1,
    watchDrag,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();

  const {
    data: { categories },
  } = useSuspenseQuery(CategoryQueries.categoriesForUser());

  const allCategories = useMemo(() => [{ id: 0, name: '전체' }, ...categories], [categories]);
  const categoryIds = allCategories.map((c) => c.id);

  const [tabIndex, setTabIndex] = useQueryState('tab', {
    defaultValue: 0,
    parse: (value) => {
      const parsed = Number(value);
      if (isNaN(parsed)) return 0;
      if (!categoryIds.includes(parsed)) return 0;
      return parsed;
    },
    serialize: String,
    history: 'push',
  });

  const didInitRef = useRef(false);

  const setContainerHeight = useCallback(() => {
    if (!containerRef.current || !embla) return;

    const index = embla.selectedScrollSnap();

    if (index === null) return;

    const slide = containerRef.current.querySelector(
      `[data-tab-index="${allCategories[index].id}"]`,
    );
    if (!slide || !slide.clientHeight) return;
    containerRef.current.style.height = `${slide.clientHeight}px`;
  }, [allCategories, embla]);

  useEffect(() => {
    if (didInitRef.current) return;
    if (!embla) return;

    const index = allCategories.findIndex((c) => c.id === tabIndex);
    if (index < 0) return;

    requestAnimationFrame(() => {
      embla.scrollTo(index, true);
      didInitRef.current = true;
    });
  }, [tabIndex, embla, allCategories]);

  useEffect(() => {
    if (!embla) return;
    const handleEmblaSelect = () => {
      const index = embla.selectedScrollSnap();
      const newId = allCategories[index]?.id;
      if (typeof newId === 'number' && newId !== tabIndex) {
        startTransition(() => {
          setTabIndex(newId);
        });
      }
    };

    embla.on('select', handleEmblaSelect);

    return () => {
      embla.off('select', handleEmblaSelect);
    };
  }, [embla, setTabIndex, allCategories, tabIndex]);

  const handleTabChange = useCallback(
    (value: string) => {
      const nextIndex = Number(value);
      if (nextIndex === tabIndex) return;
      embla?.scrollTo(nextIndex, Math.abs(nextIndex - tabIndex) > 1);
    },
    [embla, tabIndex],
  );

  return (
    <Tabs.Root value={`${tabIndex}`} onValueChange={handleTabChange} asChild>
      <div className="relative">
        <TabBar allCategories={allCategories} tabIndex={tabIndex} onTabClick={handleTabChange} />

        <div ref={emblaRef} className="mt-[72px] overflow-hidden">
          <div ref={containerRef} className="flex items-start">
            <WatchDragContext.Provider value={{ setWatchDrag }}>
              {allCategories.map((category) => (
                <div
                  key={category.id}
                  className="min-w-full flex-[0_0_100%] px-5"
                  data-tab-index={category.id}
                >
                  {Math.abs(category.id - tabIndex) <= 1 ? (
                    <Suspense fallback={<TrendingListSkeleton />}>
                      <TrendingList
                        categoryId={category.id}
                        categoryName={category.name}
                        onReady={category.id === tabIndex ? setContainerHeight : undefined}
                      />
                    </Suspense>
                  ) : (
                    <TrendingListSkeleton />
                  )}
                </div>
              ))}
            </WatchDragContext.Provider>
          </div>
        </div>
      </div>
    </Tabs.Root>
  );
};

const TrendingListSkeleton = () => {
  return (
    <div className="grid w-full animate-pulse grid-cols-2 gap-4 smd:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="w-full">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-200">
            <IllustStandingSmall className="h-12 w-12 text-gray-400" />
          </div>
          <div className="flex flex-col">
            <span
              className={cn({
                'line-clamp-2 h-12 break-words pt-2 text-sm text-gray-700': true,
              })}
            >
              <div className="mt-2 h-4 w-full rounded bg-gray-200"></div>
              <div className="mt-1 h-4 w-3/4 rounded bg-gray-200"></div>
            </span>
            <div className="h-9 w-16 max-w-[98px] rounded bg-gray-200 pt-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

const TabBar = ({
  allCategories,
  tabIndex,
  onTabClick,
}: {
  allCategories: { id: number; name: string }[];
  tabIndex: number;
  onTabClick: (id: string) => void;
}) => {
  const { isHeaderVisible } = useVisibilityOnScroll();

  const tabDragRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  const x = useMotionValue(0);

  const tabIndicatorLeft = useMotionValue(0);
  const tabIndicatorWidth = useMotionValue(0);
  const springLeft = useSpring(tabIndicatorLeft, { damping: 30, stiffness: 250 });
  const springWidth = useSpring(tabIndicatorWidth, { damping: 30, stiffness: 250 });

  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const container = tabDragRef.current;
    if (!container) return;

    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const maxScroll = scrollWidth - clientWidth;

    setConstraints({ left: -maxScroll, right: 0 });
  }, [allCategories]);

  useEffect(() => {
    const scrollToTab = () => {
      const container = tabDragRef.current;
      if (!container) return;

      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      const maxScroll = scrollWidth - clientWidth;

      const activeTab = container.children[tabIndex] as HTMLElement;
      if (activeTab) {
        const padding = 16 * 2;
        const visibleStart = -x.get();
        const visibleEnd = visibleStart + clientWidth;

        let targetScroll = visibleStart;
        if (activeTab.offsetLeft < visibleStart + padding) {
          targetScroll = activeTab.offsetLeft - padding;
        } else if (activeTab.offsetLeft + activeTab.offsetWidth > visibleEnd - padding) {
          targetScroll = activeTab.offsetLeft + activeTab.offsetWidth - clientWidth + padding;
        }

        animate(x, -Math.min(Math.max(0, targetScroll), maxScroll), {
          type: 'spring',
          damping: 40,
          stiffness: 300,
        });

        tabIndicatorLeft.set(activeTab.offsetLeft);
        tabIndicatorWidth.set(activeTab.offsetWidth);
      }
    };

    scrollToTab();
  }, [tabIndex, tabIndicatorLeft, tabIndicatorWidth, x]);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    dragStartX.current = e.clientX;
    e.preventDefault();
  };

  const handlePointerUp = (e: React.PointerEvent, id: string) => {
    const dx = Math.abs(e.clientX - (dragStartX.current ?? 0));
    if (dx < 5) {
      onTabClick(id);
    }
  };

  return (
    <div
      className={cn([
        'sticky top-0 z-30 overflow-hidden bg-white pl-4 pr-12 shadow-sm transition-transform',
        {
          'translate-y-0': !isHeaderVisible,
          'translate-y-[56px]': isHeaderVisible,
        },
      ])}
    >
      <Tabs.List asChild>
        <motion.div
          ref={tabDragRef}
          style={{ x }}
          drag="x"
          dragConstraints={constraints}
          dragElastic={0.1}
          dragTransition={{ power: 0.2, timeConstant: 250, modifyTarget: (v) => Math.round(v) }}
          className="relative flex"
        >
          {allCategories.map((category) => (
            <Tabs.Trigger
              key={category.id}
              value={`${category.id}`}
              onPointerDown={(e) => handlePointerDown(e, category.id.toString())}
              onPointerUp={(e) => handlePointerUp(e, category.id.toString())}
              className={cn(
                'relative h-[40px] shrink-0 whitespace-nowrap px-3 py-2 text-base transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                tabIndex === category.id
                  ? 'font-semibold text-primary-600'
                  : 'font-medium text-gray-500 hover:text-gray-900',
              )}
            >
              {category.name}
            </Tabs.Trigger>
          ))}
          <motion.div
            style={{ left: springLeft, width: springWidth }}
            className="absolute bottom-[0.1px] h-0.5 bg-primary-600"
          />
        </motion.div>
      </Tabs.List>
      <div className="absolute bottom-0 right-0 flex h-full w-16 items-center">
        <div className="h-full w-4 bg-gradient-to-r from-transparent to-white" />
        <div className="flex h-full items-center justify-center bg-white pr-5">
          <Link
            className="-m-2 p-2"
            href={'/mypage/categories'}
            prefetch={false}
            aria-label="카테고리 설정 페이지로 이동"
          >
            <Setting />
          </Link>
        </div>
      </div>
    </div>
  );
};
