import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import PressableScale from '@/shared/components/PressableScale';
import DisplayProductSource from '@/shared/components/product/DisplayProductSource';
import NoImage from '@/shared/components/product/NoImage';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {displayTime} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';

import {HomeQueries} from '../api/home.queries';
import type {ProductCardType} from '../model/types';
import {DisplayListPrice} from './cards/HomeCardPrimitives';

/**
 * 지름알림 랭킹 슬라이더. web: widgets/home/ui/JirumRankingSlider.tsx
 *
 * ★ swiper → FlatList. web 이 쓰는 기능은:
 *     slidesPerView:'auto' + centeredSlides + loop + realIndex
 *   loop 는 뺐다 — 10장짜리 유한 목록이라 끝에서 멈추는 편이 RN 관성 스크롤과
 *   더 자연스럽고, 무한 루프를 FlatList 로 흉내내면 인덱스 보정 버그가 따라온다.
 *   나머지는 snapToInterval + onViewableItemsChanged 로 1:1 대응한다.
 *
 * ★ getVisibleSlides(swiper.slides 를 직접 읽는 유틸)는 이식하지 않는다 —
 *   viewabilityConfig 가 같은 일을 한다.
 *
 * ★ web 의 광고 슬라이드 삽입(Persil 하드코딩 + slideIndex 보정 i>=3?i+1:i)은
 *   기간 만료 배너라 옮기지 않는다. 자체 광고 슬롯(ActiveAds)과는 다른 물건이다.
 */

const CARD_HEIGHT = 364; // web h-[364px]
const THUMB_HEIGHT = 240; // web h-[240px]
const CARD_WIDTH = 240; // web style width 240px (mobile)
const GAP = 4; // web spaceBetween: 4
const SNAP = CARD_WIDTH + GAP;

export default function JirumRankingSlider({
  onPressProduct,
}: {
  onPressProduct: (id: number) => void;
}) {
  const {data, isPending, isError, refetch} = useQuery(HomeQueries.ranking());
  const [activeIndex, setActiveIndex] = useState(0);

  const screenWidth = Dimensions.get('window').width;
  // centeredSlides: 첫/마지막 카드도 가운데 오도록 좌우 여백을 준다.
  const sidePadding = Math.max(0, (screenWidth - CARD_WIDTH) / 2);

  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 60}).current;
  const onViewableItemsChanged = useRef(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      const first = viewableItems[0];
      if (typeof first?.index === 'number') setActiveIndex(first.index);
    },
  ).current;

  if (isPending) {
    return (
      <View
        style={{height: CARD_HEIGHT}}
        className="items-center justify-center">
        <ActivityIndicator size="small" color="#667085" />
      </View>
    );
  }

  if (isError) {
    return <SectionErrorRow label="지름알림 랭킹" onRetry={refetch} />;
  }

  const products = data ?? [];
  if (products.length === 0) return null;

  return (
    <View>
      <FlatList
        horizontal
        data={products}
        keyExtractor={item => String(item.id)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        contentContainerStyle={{paddingHorizontal: sidePadding}}
        ItemSeparatorComponent={() => <View style={{width: GAP}} />}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        getItemLayout={(_, index) => ({
          length: SNAP,
          offset: SNAP * index,
          index,
        })}
        renderItem={({item, index}) => (
          <RankingCard
            product={item}
            rank={index + 1}
            isActive={index === activeIndex}
            onPress={onPressProduct}
          />
        )}
      />
      <SliderDots total={products.length} activeIndex={activeIndex} />
    </View>
  );
}

/**
 * 랭킹 카드. web ProductRankingImageCard.
 * 비활성 카드는 scale-90, 활성은 scale-100 (web 과 동일).
 */
function RankingCard({
  product,
  rank,
  isActive,
  onPress,
}: {
  product: ProductCardType;
  rank: number;
  isActive: boolean;
  onPress: (id: number) => void;
}) {
  return (
    // ★scale 은 바깥에서 준다 — PressableScale 이 자체 Animated transform 을 쓰므로
    // style 에 transform 을 같이 넣으면 눌림 애니메이션과 충돌한다.
    <View style={{transform: [{scale: isActive ? 1 : 0.9}]}}>
      <PressableScale
        scaleTo={0.96}
        style={{width: CARD_WIDTH, height: CARD_HEIGHT}}
        onPress={() => onPress(Number(product.id))}
        accessibilityRole="button"
        accessibilityLabel={`${rank}위 ${product.title}`}
        // ★className 은 안쪽 View 가 받는다(PressableScale 주석 참조).
        // 여기에 높이를 안 주면 배경이 콘텐츠 높이까지만 칠해져 뒤 회색이 비친다.
        className="h-full w-full overflow-hidden rounded-lg bg-white">
        <View style={{height: THUMB_HEIGHT}} className="w-full bg-gray-50">
          <View className="absolute top-0 left-0 z-10 h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-900">
            <Text className="text-primary-500 text-sm font-medium">{rank}</Text>
          </View>
          {product.thumbnail ? (
            <Image
              source={{uri: product.thumbnail}}
              style={{width: '100%', height: '100%'}}
              resizeMode="cover"
            />
          ) : (
            <NoImage categoryId={product.categoryId} type="product" />
          )}
        </View>
        {/* 남은 높이(364-240=124)에 제목 2줄·메타·가격이 들어간다. 넘치면 잘리므로
            flex-1 로 묶고 각 줄에 numberOfLines 를 건다. */}
        <View className="flex-1 justify-start p-3">
          <Text className="text-sm text-gray-700" numberOfLines={2}>
            {product.title}
          </Text>
          <DisplayProductSource
            mallName={product.mallName}
            providerName={product.provider?.nameKr}
            time={product.postedAt ? displayTime(product.postedAt) : undefined}
          />
          <View className="pt-1">
            <DisplayListPrice price={product.price} className="font-bold" />
          </View>
        </View>
      </PressableScale>
    </View>
  );
}

/** web SliderDots — 3px 점, 활성만 gray-600. */
function SliderDots({
  total,
  activeIndex,
}: {
  total: number;
  activeIndex: number;
}) {
  return (
    <View
      className="mx-auto h-5 w-full flex-row items-center justify-center"
      accessibilityRole="tablist">
      {Array.from({length: total}).map((_, i) => (
        <View
          key={i}
          accessibilityRole="tab"
          accessibilityState={{selected: i === activeIndex}}
          className={cn(
            'h-[3px] w-[3px]',
            i === activeIndex ? 'bg-gray-600' : 'bg-gray-400',
          )}
          style={{marginHorizontal: i === activeIndex ? 3 : 0}}
        />
      ))}
    </View>
  );
}
