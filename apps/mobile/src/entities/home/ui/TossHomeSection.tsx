import React, {useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import PressableScale from '@/shared/components/PressableScale';
import {cn} from '@/shared/lib/styling';

import {HomeQueries} from '../api/home.queries';
import {toTossDeal} from '../lib/toss';
import TossDealCard from './cards/TossDealCard';

/**
 * 홈의 토스 특가 섹션. web: widgets/home/ui/TossHomeSection.tsx
 * "쇼핑몰별 모아보기"(GRID_TABBED)와 같은 구조 — 3열 그리드 + 탭.
 *
 * ★ 카테고리 인기 탭만 2단이다 — 하위 카테고리 탭이 섹션탭과 그리드 사이에 뜬다.
 * ★ 실데이터다(8개 섹션 전부 실측 확인). web 의 `mock.ts` 에서 오는 건 타입과
 *   섹션 목록뿐이고 딜은 API 다.
 */

const CATEGORY_SECTION_ID = 'category';

/** web TOSS_SECTIONS 의 id/label. 딜 데이터는 API 에서 온다. */
export const TOSS_SECTIONS = [
  {id: 'daily', label: '하루특가'},
  {id: 'best', label: '지금인기'},
  {id: 'rising', label: '급상승'},
  {id: 'category', label: '카테고리인기'},
  {id: 'creator', label: '크리에이터'},
  {id: 'lowest', label: '최저가'},
  {id: 'conversion', label: '전환율'},
] as const;

export default function TossHomeSection({
  onPressProduct,
  onPressViewMore,
}: {
  onPressProduct: (id: number) => void;
  /** web `/toss?tab={activeId}` — 지금 보고 있는 탭 그대로 연다. */
  onPressViewMore?: (link: string, title: string) => void;
}) {
  const [activeId, setActiveId] = useState<string>(TOSS_SECTIONS[0].id);
  const [activeCat, setActiveCat] = useState<string | undefined>(undefined);
  const isCategory = activeId === CATEGORY_SECTION_ID;

  const {data: categoryLabels = []} = useQuery({
    ...HomeQueries.tossLabels(),
    enabled: isCategory,
  });

  const cat = isCategory ? activeCat ?? categoryLabels[0] : undefined;

  const {data: rawDeals = [], isFetched} = useQuery({
    ...HomeQueries.tossSectionProducts(activeId, cat ?? null),
    enabled: !isCategory || !!cat,
    placeholderData: prev => prev,
  });

  const deals = useMemo(() => rawDeals.map(toTossDeal), [rawDeals]);

  // web 과 동일 — 불러왔는데 0건이면 섹션을 통째로 숨긴다.
  if (isFetched && deals.length === 0) return null;

  const selectTab = (id: string) => {
    setActiveId(id);
    setActiveCat(undefined); // 섹션 바꾸면 하위 카테고리 초기화
  };

  return (
    <View style={{gap: 8}}>
      <View
        className="h-14 w-full flex-row items-center justify-between"
        style={{paddingHorizontal: 20}}>
        <Text className="text-lg font-bold text-gray-900">토스 특가</Text>
        {onPressViewMore ? (
          <Pressable
            onPress={() =>
              onPressViewMore(`/toss?tab=${activeId}`, '토스 특가')
            }
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="토스 특가 더보기">
            <Text className="text-sm text-gray-500">더보기</Text>
          </Pressable>
        ) : null}
      </View>

      <ChipRow
        items={TOSS_SECTIONS.map(s => ({id: s.id, label: s.label}))}
        activeId={activeId}
        onSelect={selectTab}
      />

      {isCategory && categoryLabels.length > 0 ? (
        <ChipRow
          items={categoryLabels.map(label => ({id: label, label}))}
          activeId={cat ?? ''}
          onSelect={setActiveCat}
          variant="sub"
        />
      ) : null}

      {!isFetched ? (
        <View className="h-40 items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : (
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginHorizontal: -6,
          }}>
          {deals.map(deal => (
            <View
              key={deal.id}
              style={{
                width: '33.333%',
                paddingHorizontal: 6,
                marginBottom: 20,
              }}>
              <TossDealCard deal={deal} onPress={onPressProduct} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** 섹션 탭 / 하위 카테고리 탭 공용 칩 줄. web PromotionTabs 와 같은 모양. */
export function ChipRow({
  items,
  activeId,
  onSelect,
  variant = 'main',
}: {
  items: {id: string; label: string}[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: 'main' | 'sub';
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // ★높이를 고정한다. ScrollView 는 안 주면 콘텐츠보다 큰 영역을 잡아
      // 칩 위아래에 빈 띠가 생긴다(사용자 지적: "뱃지 영역에 여백이 크다").
      // 칩 실제 높이 = text-sm(20) + py-1.5(6*2) + border(2) ≈ 34px.
      style={{flexGrow: 0, height: variant === 'sub' ? 30 : 34}}
      contentContainerStyle={{
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 8,
      }}>
      {items.map(item => {
        const isActive = item.id === activeId;
        return (
          <PressableScale
            key={item.id}
            onPress={() => onSelect(item.id)}
            accessibilityRole="button"
            accessibilityState={{selected: isActive}}
            accessibilityLabel={item.label}
            className={cn(
              'rounded-[40px] border',
              variant === 'sub' ? 'px-3 py-1' : 'px-4 py-1.5',
              isActive
                ? 'border-secondary-500 bg-secondary-50'
                : 'border-gray-300 bg-white',
            )}>
            <Text
              className={cn(
                variant === 'sub' ? 'text-xs' : 'text-sm',
                isActive ? 'text-secondary-800 font-semibold' : 'text-gray-700',
              )}>
              {item.label}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
