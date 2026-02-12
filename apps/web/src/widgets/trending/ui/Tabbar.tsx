'use client';

import { animate, motion, useMotionValue, useSpring } from 'motion/react';
import { Tabs } from 'radix-ui';
import { startTransition, useEffect, useRef, useState } from 'react';

import useVisibilityOnScroll from '@/shared/hooks/useVisibilityOnScroll';
import { cn } from '@/shared/lib/cn';
import { Setting } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

// 스타일 관련 타입 정의
interface TabBarStyles {
  container?: string;
  tabList?: string;
  tabTrigger?: {
    base?: string;
    active?: string;
    inactive?: string;
  };
  tabIndicator?: string;
  settingsContainer?: string;
  settingsGradient?: string;
  settingsButton?: string;
}

// 애니메이션 설정 타입 정의
interface TabBarAnimationConfig {
  spring?: {
    damping?: number;
    stiffness?: number;
  };
  scroll?: {
    damping?: number;
    stiffness?: number;
  };
  drag?: {
    power?: number;
    timeConstant?: number;
    elastic?: number;
  };
}

interface TabBarProps {
  allCategories: { id: number; name: string }[];
  tabIndex: number;
  onTabClick: (id: number) => void;
  styles?: TabBarStyles;
  animationConfig?: TabBarAnimationConfig;
  settingsHref?: string;
  settingsIcon?: React.ReactNode;
  settingsAriaLabel?: string;
  showSettings?: boolean;
  isHeaderVisible?: boolean; // 외부에서 헤더 가시성 제어
}

// 기본 스타일 정의
const defaultStyles: Required<TabBarStyles> = {
  container: 'sticky top-0 z-30 overflow-hidden bg-white pl-4 pr-12 shadow-xs transition-transform',
  tabList: 'relative flex',
  tabTrigger: {
    base: 'relative h-[40px] shrink-0 whitespace-nowrap px-3 py-2 text-base transition-colors duration-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    active: 'font-semibold text-primary-600',
    inactive: 'font-medium text-gray-500 hover:text-gray-900',
  },
  tabIndicator: 'absolute bottom-[0.1px] h-0.5 bg-primary-600',
  settingsContainer: 'absolute bottom-0 right-0 flex h-full w-16 items-center',
  settingsGradient: 'h-full w-4 bg-linear-to-r from-transparent to-white',
  settingsButton: '-m-2 p-2',
};

// 기본 애니메이션 설정
const defaultAnimationConfig: Required<TabBarAnimationConfig> = {
  spring: {
    damping: 30,
    stiffness: 250,
  },
  scroll: {
    damping: 40,
    stiffness: 300,
  },
  drag: {
    power: 0.2,
    timeConstant: 250,
    elastic: 0.1,
  },
};

const TabBar = ({
  allCategories,
  tabIndex,
  onTabClick,
  styles = {},
  animationConfig = {},
  settingsHref = '/mypage/categories',
  settingsIcon = <Setting />,
  settingsAriaLabel = '카테고리 설정 페이지로 이동',
  showSettings = true,
  isHeaderVisible: externalHeaderVisible,
}: TabBarProps) => {
  const categoryIds = allCategories.map((c) => c.id);

  // 외부에서 isHeaderVisible이 제공되지 않으면 내부 훅 사용
  const { isHeaderVisible: internalHeaderVisible } = useVisibilityOnScroll();
  const isHeaderVisible = externalHeaderVisible ?? internalHeaderVisible;

  const tabDragRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  const x = useMotionValue(0);

  // 스타일과 애니메이션 설정 병합
  const mergedStyles = {
    container: cn(defaultStyles.container, styles.container),
    tabList: cn(defaultStyles.tabList, styles.tabList),
    tabTrigger: {
      base: cn(defaultStyles.tabTrigger.base, styles.tabTrigger?.base),
      active: cn(defaultStyles.tabTrigger.active, styles.tabTrigger?.active),
      inactive: cn(defaultStyles.tabTrigger.inactive, styles.tabTrigger?.inactive),
    },
    tabIndicator: cn(defaultStyles.tabIndicator, styles.tabIndicator),
    settingsContainer: cn(defaultStyles.settingsContainer, styles.settingsContainer),
    settingsGradient: cn(defaultStyles.settingsGradient, styles.settingsGradient),
    settingsButton: cn(defaultStyles.settingsButton, styles.settingsButton),
  };

  const mergedAnimationConfig = {
    spring: { ...defaultAnimationConfig.spring, ...animationConfig.spring },
    scroll: { ...defaultAnimationConfig.scroll, ...animationConfig.scroll },
    drag: { ...defaultAnimationConfig.drag, ...animationConfig.drag },
  };

  const tabIndicatorLeft = useMotionValue(0);
  const tabIndicatorWidth = useMotionValue(0);
  const springLeft = useSpring(tabIndicatorLeft, mergedAnimationConfig.spring);
  const springWidth = useSpring(tabIndicatorWidth, mergedAnimationConfig.spring);

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
        // 탭의 중앙이 화면 중앙에 오도록 스크롤 위치 계산
        const targetScroll = activeTab.offsetLeft + activeTab.offsetWidth / 2 - clientWidth / 2;
        const clampedScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        animate(x, -clampedScroll, {
          type: 'spring',
          ...mergedAnimationConfig.scroll,
        });

        tabIndicatorLeft.set(activeTab.offsetLeft);
        tabIndicatorWidth.set(activeTab.offsetWidth);
      }
    };
    scrollToTab();
  }, [tabIndex, tabIndicatorLeft, tabIndicatorWidth, x, mergedAnimationConfig.scroll]);

  const handlePointerDown = (e: React.PointerEvent, _id: string) => {
    dragStartX.current = e.clientX;
    e.preventDefault();
  };

  const handlePointerUp = (e: React.PointerEvent, id: string) => {
    const dx = Math.abs(e.clientX - (dragStartX.current ?? 0));
    if (dx < 5) {
      onTabClick(Number(id));
    }
  };

  return (
    <div
      className={cn([
        mergedStyles.container,
        {
          'translate-y-0': !isHeaderVisible,
          'translate-y-14': isHeaderVisible,
        },
      ])}
    >
      <Tabs.List asChild>
        <motion.div
          ref={tabDragRef}
          style={{ x }}
          drag="x"
          dragConstraints={constraints}
          dragElastic={mergedAnimationConfig.drag.elastic}
          dragTransition={{
            power: mergedAnimationConfig.drag.power,
            timeConstant: mergedAnimationConfig.drag.timeConstant,
            modifyTarget: (v) => Math.round(v),
          }}
          className={mergedStyles.tabList}
        >
          {allCategories.map((category) => (
            <Tabs.Trigger
              key={category.id}
              value={`${category.id}`}
              onPointerDown={(e) => handlePointerDown(e, category.id.toString())}
              onPointerUp={(e) => handlePointerUp(e, category.id.toString())}
              className={cn(
                mergedStyles.tabTrigger.base,
                tabIndex === categoryIds.indexOf(category.id)
                  ? mergedStyles.tabTrigger.active
                  : mergedStyles.tabTrigger.inactive,
              )}
            >
              <motion.span
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="inline-block"
              >
                {category.name}
              </motion.span>
            </Tabs.Trigger>
          ))}
          <motion.div
            style={{ left: springLeft, width: springWidth }}
            className={mergedStyles.tabIndicator}
          />
        </motion.div>
      </Tabs.List>
      {showSettings && (
        <div className={mergedStyles.settingsContainer}>
          <div className={mergedStyles.settingsGradient} />
          <div className="flex h-full items-center justify-center bg-white pr-5">
            <Link
              className={mergedStyles.settingsButton}
              href={settingsHref}
              aria-label={settingsAriaLabel}
            >
              {settingsIcon}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabBar;
