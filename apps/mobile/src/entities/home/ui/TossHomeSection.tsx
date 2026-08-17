import React, {useMemo, useState} from 'react';
import {ActivityIndicator, Image, ScrollView, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import PressableScale from '@/shared/components/PressableScale';
import NoImage from '@/shared/components/product/NoImage';
import {cn} from '@/shared/lib/styling';

import {HomeQueries} from '../api/home.queries';
import {type TossDeal, toTossDeal} from '../lib/toss';

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
const TOSS_SECTIONS = [
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
}: {
  onPressProduct: (id: number) => void;
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
function ChipRow({
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
      contentContainerStyle={{paddingHorizontal: 20, paddingBottom: 8, gap: 8}}>
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

/**
 * 토스 전용 카드. web TossDealCard.
 * 3열이라 카드폭이 좁다 — web 이 겪은 줄바꿈 버그(가격의 '원'까지 쪼개짐)는
 * RN 에선 numberOfLines 로 방지된다.
 */
function TossDealCard({
  deal,
  onPress,
}: {
  deal: TossDeal;
  onPress: (id: number) => void;
}) {
  const label =
    deal.badge ??
    (deal.discountRate ? `${deal.discountRate}% 특가` : undefined);

  return (
    <PressableScale
      disabled={!deal.productId}
      onPress={() => deal.productId && onPress(deal.productId)}
      accessibilityRole="button"
      accessibilityLabel={deal.title}
      style={{width: '100%'}}>
      <View
        className="w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
        style={{aspectRatio: 1}}>
        {deal.image ? (
          <Image
            source={{uri: deal.image}}
            style={{width: '100%', height: '100%'}}
            resizeMode="cover"
          />
        ) : (
          <NoImage categoryId={null} type="product" />
        )}
        {label ? (
          <View className="bg-error-500 absolute top-0 right-0 z-10 h-6 items-center justify-center rounded-tr-lg rounded-bl-lg px-2">
            <Text className="text-xs font-semibold text-white">{label}</Text>
          </View>
        ) : null}
        {deal.bestSeller ? (
          <View className="absolute bottom-0 left-0 z-10 h-[22px] justify-center rounded-tr-lg rounded-bl-lg bg-gray-900/80 px-2">
            <Text className="text-xs font-medium text-white">베스트판매자</Text>
          </View>
        ) : null}
      </View>

      <View>
        <Text
          className="pt-2 text-sm text-gray-700"
          style={{height: 48}}
          numberOfLines={2}>
          {deal.title}
        </Text>

        <View className="flex-row flex-wrap items-baseline gap-x-1.5 pt-1">
          <Text
            className="text-lg font-semibold text-gray-900"
            numberOfLines={1}>
            {deal.price.toLocaleString()}원
          </Text>
          {deal.lowestIn30Days ? (
            <Text className="text-error-500 text-xs font-bold">
              30일 최저가
            </Text>
          ) : null}
        </View>

        {deal.lowestPriceCompensation ||
        deal.arrivalGuaranteed ||
        deal.specialProduct ? (
          <View className="flex-row flex-wrap gap-1 pt-1">
            {deal.lowestPriceCompensation ? (
              <Badge className="bg-blue-50" textClassName="text-blue-600">
                최저가 보상
              </Badge>
            ) : null}
            {deal.arrivalGuaranteed ? (
              <Badge className="bg-green-50" textClassName="text-green-600">
                도착보장
              </Badge>
            ) : null}
            {deal.specialProduct ? (
              <Badge className="bg-error-50" textClassName="text-error-600">
                토스특가
              </Badge>
            ) : null}
          </View>
        ) : null}

        {deal.unitPrice ? (
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {deal.unitPrice}
          </Text>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-x-1.5 pt-1">
          {typeof deal.rating === 'number' ? (
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              <Text className="text-[#ffb200]">★</Text> {deal.rating}
              {deal.reviewCount
                ? ` (${deal.reviewCount.toLocaleString()})`
                : ''}
            </Text>
          ) : null}
          {deal.delivery ? (
            <Text className="text-xs text-gray-400" numberOfLines={1}>
              · {deal.delivery}
            </Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

function Badge({
  children,
  className,
  textClassName,
}: {
  children: string;
  className: string;
  textClassName: string;
}) {
  return (
    <View className={cn('rounded px-1.5 py-0.5', className)}>
      {/* web `whitespace-nowrap` — 3열 좁은 카드에서 "최저가 보상"이 쪼개지지 않게. */}
      <Text
        className={cn('text-[11px] font-medium', textClassName)}
        numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}
