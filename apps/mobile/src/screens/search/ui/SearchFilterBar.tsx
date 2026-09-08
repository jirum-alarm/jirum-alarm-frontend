import React from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {SearchQueries} from '@/entities/search/api/search.queries';
import {
  PERIOD_LABELS,
  SEARCH_PERIODS,
  SEARCH_SORTS,
  SORT_LABELS,
} from '@/entities/search/model/filters';
import type {SearchFiltersController} from '@/features/search/model/useSearchFilters';
import {cn} from '@/shared/lib/styling';

/**
 * 검색 필터 바. web: widgets/search/ui/SearchFilterBar.tsx
 *
 * 구성은 web 과 같다 — 정렬(텍스트 토글) · 초기화 · 품절 포함 · 카테고리 ·
 * 출처 · 기간. 정렬을 칩이 아니라 텍스트로 두는 것도 web 그대로다
 * (필터가 아니라 '모드 선택'임을 시각 어휘로 구분).
 */
export default function SearchFilterBar({
  controller,
}: {
  controller: SearchFiltersController;
}) {
  const {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    toggleCategoryId,
    toggleProviderId,
  } = controller;

  const {data: categories} = useQuery(SearchQueries.categories());
  const {data: providers} = useQuery(SearchQueries.providers());

  return (
    <View className="pb-3" style={styles.root}>
      <View className="flex-row items-center justify-between px-5">
        <View className="flex-row items-center" style={styles.sortRow}>
          {SEARCH_SORTS.map((sort, i) => (
            <View
              key={sort}
              className="flex-row items-center"
              style={styles.sortRow}>
              {i > 0 ? (
                <View className="bg-gray-200" style={styles.divider} />
              ) : null}
              <Pressable
                onPress={() => setFilters({sort})}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityState={{selected: filters.sort === sort}}
                accessibilityLabel={SORT_LABELS[sort]}
                className="py-2">
                <Text
                  className={cn(
                    'text-sm',
                    filters.sort === sort
                      ? 'font-semibold text-gray-900'
                      : // web 은 gray-400 이지만 앱은 gray-500 — 400 은 대비 2.58:1 로
                        // WCAG AA 미달이다(gray-400-text-fails-wcag-aa).
                        'text-gray-500',
                  )}>
                  {SORT_LABELS[sort]}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View className="flex-row items-center gap-3">
          {hasActiveFilters ? (
            <Pressable
              onPress={resetFilters}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel="필터 초기화"
              className="py-2">
              <Text className="text-sm text-gray-500 underline">초기화</Text>
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => setFilters({ended: !filters.ended})}
            hitSlop={4}
            accessibilityRole="checkbox"
            accessibilityState={{checked: filters.ended}}
            accessibilityLabel="품절 포함"
            className="flex-row items-center gap-1.5 py-2">
            <Checkbox checked={filters.ended} />
            <Text className="text-sm text-gray-500">품절 포함</Text>
          </Pressable>
        </View>
      </View>

      {categories && categories.length > 0 ? (
        <FilterRow label="카테고리">
          <Chip
            active={filters.categoryIds.length === 0}
            label="전체"
            onPress={() => setFilters({categoryIds: []})}
          />
          {categories.map(category => {
            const id = Number(category.id);
            return (
              <Chip
                key={id}
                active={filters.categoryIds.includes(id)}
                label={category.name}
                onPress={() => toggleCategoryId(id)}
              />
            );
          })}
        </FilterRow>
      ) : null}

      {providers && providers.length > 0 ? (
        <FilterRow label="출처">
          <Chip
            active={filters.providerIds.length === 0}
            label="전체"
            onPress={() => setFilters({providerIds: []})}
          />
          {providers.map(provider => {
            const id = Number(provider.id);
            return (
              <Chip
                key={id}
                active={filters.providerIds.includes(id)}
                label={provider.nameKr}
                onPress={() => toggleProviderId(id)}
              />
            );
          })}
        </FilterRow>
      ) : null}

      <FilterRow label="기간">
        {SEARCH_PERIODS.map(period => (
          <Chip
            key={period}
            active={filters.period === period}
            label={PERIOD_LABELS[period]}
            onPress={() => setFilters({period})}
          />
        ))}
      </FilterRow>
    </View>
  );
}

/**
 * 필터 한 줄. 라벨이 없으면 어느 칩 줄이 무슨 필터인지 알 수 없다
 * (셋 다 '전체'로 시작한다) — web 이 라벨을 붙인 이유와 같다.
 */
function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-2 pl-5">
      <Text className="text-xs text-gray-500" style={styles.rowLabel}>
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        // 높이를 고정한다 — 안 주면 ScrollView 가 콘텐츠보다 큰 영역을 잡아
        // 줄 사이에 빈 띠가 생긴다(CategoryTabBar 와 같은 처방).
        style={styles.chipStrip}
        contentContainerStyle={styles.chipStripContent}>
        {children}
      </ScrollView>
    </View>
  );
}

function Chip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{selected: active}}
      accessibilityLabel={label}
      className={cn(
        'rounded-full border px-3 py-1.5',
        active
          ? 'border-secondary-500 bg-secondary-50'
          : 'border-gray-300 bg-white',
      )}
      style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
      <Text
        className={cn(
          'text-sm',
          active ? 'text-secondary-800 font-semibold' : 'text-gray-700',
        )}>
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * 품절 포함 체크박스.
 *
 * ★칩으로 만들지 않는다 — web 이 체크박스를 쓴 이유가 "이건 필터 칩과 성격이
 * 다른 on/off 토글"이라는 표시다. RN 엔 체크박스가 없어 사각형 + 체크 글리프로
 * 그린다(체크 아이콘이 이 레포에 아직 없다).
 */
function Checkbox({checked}: {checked: boolean}) {
  return (
    <View
      className={cn(
        'items-center justify-center rounded-sm border',
        checked ? 'border-secondary-500 bg-secondary-500' : 'border-gray-300',
      )}
      style={styles.checkbox}>
      {checked ? (
        <Text className="text-white" style={styles.checkmark}>
          ✓
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {gap: 8},
  /** web gap-2.5 */
  sortRow: {gap: 10},
  divider: {width: 1, height: 12},
  /** web `w-11` — 세 라벨이 같은 폭이라 칩 줄의 시작점이 맞는다. */
  rowLabel: {width: 44},
  chipStrip: {flexGrow: 0, height: 36},
  chipStripContent: {
    alignItems: 'center',
    gap: 6,
    paddingRight: 20,
  },
  checkbox: {width: 16, height: 16},
  checkmark: {fontSize: 11, lineHeight: 13},
});
