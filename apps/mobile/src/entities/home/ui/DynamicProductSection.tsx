import React, {useMemo, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {cn} from '@/shared/lib/styling';

import {HomeQueries} from '../api/home.queries';
import type {ContentPromotionSection, PromotionTab} from '../model/types';
import DynamicProductList from './DynamicProductList';

/**
 * 섹션 하나(제목 + 더보기 + 목록). web: widgets/home/ui/DynamicProductSection.tsx
 *
 * ★ web 은 async 서버 컴포넌트 + prefetch/dehydrate 지만 RN 엔 서버가 없다.
 * 전부 클라이언트 useQuery 로 내려온다 — 구조가 오히려 단순해진다.
 * 대신 web 에 없던 로딩·에러 상태가 필요하다(홈은 첫 화면이라 특히 중요).
 */

type Props = {
  section: ContentPromotionSection;
  onPressProduct: (id: number) => void;
  onPressViewMore?: (link: string, title: string) => void;
};

export default function DynamicProductSection({
  section,
  onPressProduct,
  onPressViewMore,
}: Props) {
  if (section.tabs && section.tabs.length > 0) {
    return (
      <TabbedSection
        section={section}
        onPressProduct={onPressProduct}
        onPressViewMore={onPressViewMore}
      />
    );
  }
  return (
    <PlainSection
      section={section}
      onPressProduct={onPressProduct}
      onPressViewMore={onPressViewMore}
    />
  );
}

function PlainSection({section, onPressProduct, onPressViewMore}: Props) {
  const {data, isPending, isError, refetch} = useQuery(
    HomeQueries.section(section),
  );

  const products = data ?? [];

  /**
   * 게스트 추천 섹션은 개인화 결과가 없으면(빈 배열) 섹션 전체를 숨긴다.
   * (선호 없음/부스트 OFF 시 백엔드가 [] 반환 → 메인 핫딜과 중복 노출 방지)
   * web DynamicProductSection 과 동일 규칙. 실측상 비로그인은 항상 0건이다.
   */
  if (
    section.dataSource.queryName === 'guestRecommendedHotDeals' &&
    !isPending &&
    products.length === 0
  ) {
    return null;
  }

  return (
    <View style={{gap: 8}}>
      <SectionHeader
        title={section.title}
        viewMoreLink={section.viewMoreLink}
        onPressViewMore={onPressViewMore}
      />
      <SectionBody
        label={section.title}
        isPending={isPending}
        isError={isError}
        isEmpty={products.length === 0}
        onRetry={refetch}>
        <DynamicProductList
          type={section.type}
          products={products}
          onPressProduct={onPressProduct}
        />
      </SectionBody>
    </View>
  );
}

/**
 * 탭 섹션(GRID_TABBED). 탭마다 다른 variables 로 다시 조회한다.
 * web TabbedDynamicProductSection 과 동일 — 탭 전환 시 목록만 갈린다.
 */
function TabbedSection({section, onPressProduct, onPressViewMore}: Props) {
  // section.tabs 는 매 렌더 새 배열이 될 수 있어 그대로 쓰면 아래 useMemo 가 계속 깨진다.
  const tabs = useMemo(() => section.tabs ?? [], [section.tabs]);
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? '');

  const activeTab = useMemo(
    () => tabs.find(t => t.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId],
  );

  const {data, isPending, isError, refetch} = useQuery(
    HomeQueries.section(section, activeTab?.variables),
  );

  const products = data ?? [];
  // 탭에 개별 더보기 링크가 있으면 그쪽을 우선한다(web 과 동일).
  const viewMoreLink = activeTab?.viewMoreLink ?? section.viewMoreLink;

  return (
    <View style={{gap: 8}}>
      <SectionHeader
        title={section.title}
        viewMoreLink={viewMoreLink}
        onPressViewMore={onPressViewMore}
      />
      <PromotionTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onTabPress={tab => setActiveTabId(tab.id)}
      />
      <SectionBody
        label={section.title}
        isPending={isPending}
        isError={isError}
        isEmpty={products.length === 0}
        onRetry={refetch}>
        <DynamicProductList
          type={section.type}
          products={products}
          onPressProduct={onPressProduct}
        />
      </SectionBody>
    </View>
  );
}

/** web SectionHeader — h-14(56px), 제목 text-lg bold, 우측 더보기 text-sm gray-500. */
function SectionHeader({
  title,
  viewMoreLink,
  onPressViewMore,
}: {
  title: string;
  viewMoreLink?: string;
  onPressViewMore?: (link: string, title: string) => void;
}) {
  return (
    <View
      className="h-14 w-full flex-row items-center justify-between"
      style={{paddingHorizontal: 20}}>
      <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
        {title}
      </Text>
      {viewMoreLink && onPressViewMore ? (
        <Pressable
          onPress={() => onPressViewMore(viewMoreLink, title)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`${title} 더보기`}>
          <Text className="text-sm text-gray-500">더보기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * 탭 칩 줄. web PromotionTabs.
 * web 은 활성 탭을 scrollIntoView 로 가운데 옮긴다 → RN 은 measureLayout + scrollTo.
 */
function PromotionTabs({
  tabs,
  activeTabId,
  onTabPress,
}: {
  tabs: PromotionTab[];
  activeTabId: string;
  onTabPress: (tab: PromotionTab) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const layouts = useRef<Record<string, {x: number; width: number}>>({});
  const viewportWidth = useRef(0);

  const centerTab = (tabId: string) => {
    const layout = layouts.current[tabId];
    if (!layout || !viewportWidth.current) return;
    const target = layout.x - (viewportWidth.current - layout.width) / 2;
    scrollRef.current?.scrollTo({x: Math.max(0, target), animated: true});
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={e => {
        viewportWidth.current = e.nativeEvent.layout.width;
      }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingBottom: 8,
        gap: 8,
      }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <PressableScale
            key={tab.id}
            onLayout={e => {
              const {x, width} = e.nativeEvent.layout;
              layouts.current[tab.id] = {x, width};
            }}
            onPress={() => {
              centerTab(tab.id);
              onTabPress(tab);
            }}
            accessibilityRole="button"
            accessibilityState={{selected: isActive}}
            accessibilityLabel={tab.label}
            className={cn(
              'rounded-[40px] border px-4 py-1.5',
              isActive
                ? 'border-secondary-500 bg-secondary-50'
                : 'border-gray-300 bg-white',
            )}>
            <Text
              className={cn(
                'text-sm',
                isActive ? 'text-secondary-800 font-semibold' : 'text-gray-700',
              )}>
              {tab.label}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

/**
 * 로딩·에러·빈 상태. web 엔 없다(서버가 다 그려서 보냄) — RN 에서만 필요하다.
 * "빈 것"과 "못 불러온 것"이 구별돼야 한다(상세 디자인 리뷰 D5 와 같은 기준).
 */
function SectionBody({
  label,
  isPending,
  isError,
  isEmpty,
  onRetry,
  children,
}: {
  label: string;
  isPending: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}) {
  if (isPending) {
    return (
      <View className="h-40 items-center justify-center">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  if (isError) {
    return <SectionErrorRow label={label} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return null;
  }

  return <>{children}</>;
}
