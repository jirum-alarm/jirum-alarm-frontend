import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
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
 * ★ swiper → FlatList. web SLIDER_CONFIG_MOBILE 를 그대로 옮긴다:
 *     slidesPerView:'auto' · spaceBetween:4 · centeredSlides:true · loop:true
 *
 * ★ loop 구현: 앞뒤에 목록을 한 벌씩 덧대고(=3배), 가운데 블록에서 시작한다.
 *   가장자리 블록에 닿으면 같은 카드가 보이는 가운데 위치로 애니메이션 없이
 *   점프한다 — 사용자에겐 끊김 없이 무한히 도는 것으로 보인다.
 *   (앞서 loop 를 뺐던 건 web 동작을 임의로 바꾼 오판이었다.)
 *
 * ★ scale 은 **스크롤 오프셋에 연속으로** 물린다(web transition-all duration-300 대응).
 *   onViewableItemsChanged 로 isActive 를 토글하면 임계값을 넘는 순간 90%→100% 가
 *   한 프레임에 튀어서 "뚝 하고 넓어지는" 느낌이 난다. interpolate 로 이웃 카드까지
 *   부드럽게 이어지게 한다.
 *
 * ★ getVisibleSlides(swiper.slides 를 직접 읽는 유틸)는 이식하지 않는다 —
 *   viewabilityConfig 가 같은 일을 한다.
 *
 * ★ web 의 광고 슬라이드 삽입(Persil 하드코딩 + slideIndex 보정 i>=3?i+1:i)은
 *   기간 만료 배너라 옮기지 않는다. 자체 광고 슬롯(ActiveAds)과는 다른 물건이다.
 */

const CARD_HEIGHT = 352; // web h-[352px]
const THUMB_HEIGHT = 240; // web h-[240px]
const CARD_WIDTH = 240; // web style width 240px (mobile)
const GAP = 4; // web spaceBetween: 4
const SNAP = CARD_WIDTH + GAP;

/** loop 용 복제 배수. 앞 1벌 + 실제 1벌 + 뒤 1벌. */
const LOOP_MULTIPLIER = 3;

export default function JirumRankingSlider({
  onPressProduct,
}: {
  onPressProduct: (id: number) => void;
}) {
  const {data, isPending, isError, refetch} = useQuery(HomeQueries.ranking());
  const products = useMemo(() => data ?? [], [data]);
  const count = products.length;

  // 앞뒤로 한 벌씩 덧댄 목록. 실제 시작 위치는 가운데 블록의 0번.
  const looped = useMemo(
    () =>
      count === 0
        ? []
        : Array.from({length: count * LOOP_MULTIPLIER}, (_, i) => ({
            product: products[i % count],
            realIndex: i % count,
            key: `${products[i % count].id}-${Math.floor(i / count)}`,
          })),
    [products, count],
  );

  const listRef = useRef<Animated.FlatList<(typeof looped)[number]>>(null);
  // 도트 표시용. 스크롤 중 매 프레임 갱신하면 리렌더가 터지므로
  // 스크롤이 멈출 때만 바꾼다(scale 은 아래 scrollX 가 따로 담당).
  const [activeIndex, setActiveIndex] = useState(0);

  // scale 을 물릴 스크롤 위치. UI 스레드에서만 읽고 쓴다.
  const scrollX = useSharedValue(count * SNAP);
  const onScroll = useAnimatedScrollHandler(e => {
    scrollX.value = e.contentOffset.x;
  });

  const screenWidth = Dimensions.get('window').width;
  // centeredSlides: 카드가 항상 화면 가운데 오도록 좌우 여백을 준다.
  const sidePadding = Math.max(0, (screenWidth - CARD_WIDTH) / 2);

  // count 가 바뀌면(첫 로드) 가운데 블록으로 위치를 옮긴다.
  useEffect(() => {
    if (count === 0) return;
    setActiveIndex(0);
    scrollX.value = count * SNAP;
    listRef.current?.scrollToOffset({offset: count * SNAP, animated: false});
  }, [count, scrollX]);

  /**
   * 가장자리 블록에 닿으면 같은 카드가 보이는 가운데 블록으로 순간이동한다.
   * 스크롤이 멈춘 뒤에만 하므로 사용자는 점프를 느끼지 못한다.
   */
  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (count === 0) return;
      const idx = Math.round(e.nativeEvent.contentOffset.x / SNAP);
      setActiveIndex(((idx % count) + count) % count);

      if (idx < count || idx >= count * 2) {
        const middle = count + (((idx % count) + count) % count);
        const offset = middle * SNAP;
        scrollX.value = offset;
        listRef.current?.scrollToOffset({offset, animated: false});
      }
    },
    [count, scrollX],
  );

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

  if (count === 0) return null;

  return (
    <View>
      <Animated.FlatList
        ref={listRef}
        horizontal
        data={looped}
        keyExtractor={item => item.key}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        // ★ItemSeparatorComponent 대신 카드에 marginRight 를 준다.
        // 구분자가 있으면 항목 간격이 SNAP 과 어긋나 loop 점프가 미끄러진다.
        // 그림자가 위아래로 12px 번지므로 여유를 준다 — 안 주면 리스트
        // 경계에서 잘려 "그림자가 뚝 끊긴" 것처럼 보인다(web 은 슬라이드에 pb-5).
        contentContainerStyle={{
          paddingHorizontal: sidePadding,
          paddingTop: 6,
          paddingBottom: 20,
        }}
        initialScrollIndex={count}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({
          length: SNAP,
          offset: SNAP * index,
          index,
        })}
        renderItem={({item, index}) => (
          <RankingCard
            product={item.product}
            rank={item.realIndex + 1}
            index={index}
            scrollX={scrollX}
            onPress={onPressProduct}
          />
        )}
      />
      <SliderDots total={count} activeIndex={activeIndex} />
    </View>
  );
}

/**
 * 랭킹 카드. web ProductRankingImageCard.
 *
 * scale 은 스크롤 위치에서 연속으로 계산한다 — 가운데에 가까울수록 1,
 * 한 칸 떨어지면 0.9(web scale-90). 임계값 토글이 아니라 보간이라
 * 손가락을 따라 부드럽게 커지고 작아진다.
 */
function RankingCard({
  product,
  rank,
  index,
  scrollX,
  onPress,
}: {
  product: ProductCardType;
  rank: number;
  index: number;
  scrollX: SharedValue<number>;
  onPress: (id: number) => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(scrollX.value - index * SNAP);
    const scale = interpolate(
      distance,
      [0, SNAP],
      [1, 0.9],
      Extrapolation.CLAMP,
    );
    // 가운데에서 멀수록 그림자를 옅게 — 작아진 카드에 짙은 그림자가 남으면
    // 카드가 떠 보인다(사용자 지적: "하단 그림자가 어색하다").
    const shadowOpacity = interpolate(
      distance,
      [0, SNAP],
      [0.1, 0.04],
      Extrapolation.CLAMP,
    );
    return {transform: [{scale}], shadowOpacity};
  });

  return (
    // ★그림자와 클리핑은 반드시 다른 View 에 준다.
    // iOS 는 그림자를 그리려면 그 View 가 overflow:visible 이어야 해서,
    // 같은 View 에 overflow-hidden 을 걸면 클리핑이 무력화된다
    // (썸네일이 카드 밖으로 삐져나온다). 바깥=그림자, 안쪽=클리핑.
    <Animated.View
      style={[
        {
          marginRight: GAP,
          borderRadius: 8,
          backgroundColor: '#fff',
          // web shadow-[0_2px_12px_rgba(0,0,0,0.08)].
          // 모바일 카드엔 border 가 없어 이 그림자가 유일한 경계다.
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowRadius: 12,
          elevation: 3,
        },
        animatedStyle,
      ]}>
      <PressableScale
        scaleTo={0.96}
        style={{width: CARD_WIDTH, height: CARD_HEIGHT}}
        onPress={() => onPress(Number(product.id))}
        accessibilityRole="button"
        accessibilityLabel={`${rank}위 ${product.title}`}
        // ★className 은 안쪽 View 가 받는다(PressableScale 주석 참조).
        className="h-full w-full overflow-hidden rounded-lg bg-white">
        <View
          style={{height: THUMB_HEIGHT}}
          className="w-full overflow-hidden bg-gray-50">
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
        {/* web `p-3 pb-0` — 위에서부터 쌓고 하단 패딩은 없다.
            ★앞서 justify-between + pb-3 을 넣었더니 제목·메타·가격 사이가
            벌어져 어색했다(사용자 지적). web 처럼 붙여 쌓는 게 맞다. */}
        <View className="px-3 pt-3">
          <Text className="text-sm text-gray-700" numberOfLines={2}>
            {product.title}
          </Text>
          <DisplayProductSource
            mallName={product.mallName}
            providerName={product.provider?.nameKr}
            time={product.postedAt ? displayTime(product.postedAt) : undefined}
          />
          {/* web `pt-2`(8px). DisplayListPrice 가 semibold 를 이미 갖고 있어
              font-bold 를 덧대면 web 보다 굵어진다 — 덧대지 않는다. */}
          <View className="pt-2">
            <DisplayListPrice price={product.price} />
          </View>
        </View>
      </PressableScale>
    </Animated.View>
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
      {Array.from({length: total}).map((_, i) => {
        const isActive = i === activeIndex;
        // web: 활성 점 자체는 마진 0, **이웃**만 활성 쪽으로 6px 벌어진다.
        const prevActive = i - 1 === activeIndex;
        const nextActive = i + 1 === activeIndex;
        return (
          <View
            key={i}
            accessibilityRole="tab"
            accessibilityState={{selected: isActive}}
            className={cn(
              'h-[3px] w-[3px]',
              isActive ? 'bg-gray-600' : 'bg-gray-400',
            )}
            style={{
              marginLeft: !isActive && prevActive ? 6 : 0,
              marginRight: !isActive && nextActive ? 6 : 0,
            }}
          />
        );
      })}
    </View>
  );
}
