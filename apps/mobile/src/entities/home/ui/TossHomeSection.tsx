import React, {useMemo, useState} from 'react';
import {ActivityIndicator, ScrollView, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {HomeQueries} from '../api/home.queries';
import {toTossDeal, TOSS_HOME_SECTION_IDS} from '../lib/toss';
import TossDealCard from './cards/TossDealCard';
import Chip from '@/shared/components/ui/Chip';
import SectionHeader from '@/shared/components/ui/SectionHeader';
import TabPill from '@/shared/components/ui/TabPill';

/**
 * 홈의 토스 특가 섹션. web: widgets/home/ui/TossHomeSection.tsx
 * "쇼핑몰별 모아보기"(GRID_TABBED)와 같은 구조 — 3열 그리드 + 탭.
 *
 * ★ 카테고리 인기 탭만 2단이다 — 하위 카테고리 탭이 섹션탭과 그리드 사이에 뜬다.
 * ★ 홈 탭은 공식 Open API 3종(하루특가·BEST·카테고리인기)만.
 *   나머지는 /toss 목록에서만 보인다.
 */

const CATEGORY_SECTION_ID = 'category';
const HOME_SECTION_ID_SET = new Set<string>(TOSS_HOME_SECTION_IDS);

/** web TOSS_SECTIONS 의 id/label. 딜 데이터는 API 에서 온다. /toss 목록은 전체. */
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
  const [activeId, setActiveId] = useState<string>(TOSS_HOME_SECTION_IDS[0]);
  const [activeCat, setActiveCat] = useState<string | undefined>(undefined);
  const isCategory = activeId === CATEGORY_SECTION_ID;

  const {data: categoryLabels = [], isFetched: labelsFetched} = useQuery({
    ...HomeQueries.tossLabels(),
  });

  const homeSections = TOSS_SECTIONS.filter(s => {
    if (!HOME_SECTION_ID_SET.has(s.id)) return false;
    if (
      s.id === CATEGORY_SECTION_ID &&
      labelsFetched &&
      categoryLabels.length === 0
    ) {
      return false;
    }
    return true;
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
      <SectionHeader
        title="토스 특가"
        onPressMore={
          onPressViewMore
            ? () => onPressViewMore(`/toss?tab=${activeId}`, '토스 특가')
            : undefined
        }
      />

      <ChipRow
        items={homeSections.map(s => ({id: s.id, label: s.label}))}
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
          <ActivityIndicator size="small" className="text-gray-500" />
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

/** 줄 높이 = 칩 md(text-sm 20 + py-1.5 12 + border 2) · 탭 sm(h-8) · 탭 md(h-9). */
const ROW_HEIGHT = {main: 34, sub: 32, tab: 36} as const;

/**
 * 고르는 줄. web 과 같은 모양을 자리마다 고른다 —
 * main = 섹션 탭(web PromotionTabs, 테두리 칩), sub = 토스 하위 카테고리(web TossCategoryTabs, 채운 탭),
 * tab = 큐레이션 탭(web CurationContainer, 채운 탭).
 */
export function ChipRow({
  items,
  activeId,
  onSelect,
  variant = 'main',
}: {
  items: {id: string; label: string}[];
  activeId: string;
  onSelect: (id: string) => void;
  variant?: 'main' | 'sub' | 'tab';
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      // ★높이를 고정한다. ScrollView 는 안 주면 콘텐츠보다 큰 영역을 잡아
      // 칩 위아래에 빈 띠가 생긴다(사용자 지적: "뱃지 영역에 여백이 크다").
      style={{flexGrow: 0, height: ROW_HEIGHT[variant]}}
      contentContainerStyle={{
        paddingHorizontal: 20,
        alignItems: 'center',
        gap: 8,
      }}>
      {items.map(item => {
        const isActive = item.id === activeId;
        return variant === 'main' ? (
          <Chip
            key={item.id}
            label={item.label}
            selected={isActive}
            onPress={() => onSelect(item.id)}
          />
        ) : (
          <TabPill
            key={item.id}
            label={item.label}
            selected={isActive}
            size={variant === 'sub' ? 'sm' : 'md'}
            onPress={() => onSelect(item.id)}
          />
        );
      })}
    </ScrollView>
  );
}
