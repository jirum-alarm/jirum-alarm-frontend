import {prefetchProductDetail} from '@/entities/product/prefetch-detail';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  View,
  useColorScheme,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
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
import Thumbnail from '@/shared/components/product/Thumbnail';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {trackProductCardClick} from '@/shared/lib/analytics/card-tracking';
import {displayTime} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';

import {HomeQueries} from '../api/home.queries';
import type {ProductCardType} from '../model/types';
import {DisplayListPrice} from './cards/HomeCardPrimitives';
import {useColors} from '@/shared/theme/useColors';

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

type LoopedItem = {product: ProductCardType; realIndex: number; key: string};

export default function JirumRankingSlider({
  onPressProduct,
}: {
  onPressProduct: (id: number) => void;
}) {
  const {data, isPending, isError, refetch} = useQuery(HomeQueries.ranking());
  const products = useMemo(() => data ?? [], [data]);
  const count = products.length;

  // 앞뒤로 한 벌씩 덧댄 목록. 실제 시작 위치는 가운데 블록의 0번.
  const looped = useMemo<LoopedItem[]>(
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

  const listRef = useRef<Animated.FlatList<LoopedItem>>(null);
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

  // ★renderItem 을 고정한다 — 인라인이면 도트 갱신(activeIndex)마다 새 함수라
  // 3벌로 덧댄 카드가 memo 를 무시하고 전부 다시 그려진다.
  const renderItem = useCallback(
    ({item, index}: {item: LoopedItem; index: number}) => (
      <RankingCard
        product={item.product}
        rank={item.realIndex + 1}
        index={index}
        isLoopCopy={index < count || index >= count * 2}
        scrollX={scrollX}
        onPress={onPressProduct}
      />
    ),
    [count, scrollX, onPressProduct],
  );

  if (isPending) {
    return (
      <View
        style={{height: CARD_HEIGHT}}
        className="items-center justify-center">
        <ActivityIndicator size="small" className="text-gray-500" />
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
        renderItem={renderItem}
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
// ★memo — scale 은 UI 스레드(scrollX)가 맡아 카드가 JS 에서 다시 그려질 일이 없다.
const RankingCard = React.memo(function RankingCard({
  product,
  rank,
  index,
  isLoopCopy,
  scrollX,
  onPress,
}: {
  product: ProductCardType;
  rank: number;
  index: number;
  isLoopCopy: boolean;
  scrollX: SharedValue<number>;
  onPress: (id: number) => void;
}) {
  const c = useColors();
  const isDark = useColorScheme() === 'dark';
  // ★테두리는 카드 칸(CARD_WIDTH) 안에서 먹는다. 바깥에 더하면 다크에서만 칸이 2px 넓어져
  // SNAP 과 어긋나고, 그 오차가 카드 수만큼 쌓여 모드를 바꿀 때 슬라이더가 옆으로 밀렸다(사용자 지적).
  const border = isDark ? 1 : 0;
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
      // 앞뒤 복제 블록은 loop 용 허상이라 스크린리더가 같은 카드를 3번 읽지 않게 숨긴다.
      accessibilityElementsHidden={isLoopCopy}
      importantForAccessibility={isLoopCopy ? 'no-hide-descendants' : 'auto'}
      style={[
        {
          marginRight: GAP,
          borderRadius: 8,
          // web shadow-[0_2px_12px_rgba(0,0,0,0.08)].
          // 모바일 카드엔 border 가 없어 이 그림자가 유일한 경계다.
          // 다크에선 검은 그림자가 안 보이고 카드가 바탕과 같은 색이라 경계가 사라진다 →
          // 한 단 밝은 면(gray-50) + 1px 선(gray-100)으로 경계를 대신한다.
          backgroundColor: isDark ? c.gray[50] : c.white,
          borderWidth: border,
          borderColor: c.gray[100],
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowRadius: 12,
          elevation: 3,
        },
        animatedStyle,
      ]}>
      <PressableScale
        scaleTo={0.96}
        style={{
          width: CARD_WIDTH - border * 2,
          height: CARD_HEIGHT - border * 2,
        }}
        onPressIn={() =>
          prefetchProductDetail(Number(product.id), product.thumbnail)
        }
        onPress={() => {
          // web ProductRankingImageCard: source="home_ranking", rank 1-based.
          trackProductCardClick('home_ranking', product.id, rank);
          onPress(Number(product.id));
        }}
        accessibilityRole="button"
        accessibilityLabel={`${rank}위 ${product.title}`}
        // ★className 은 안쪽 View 가 받는다(PressableScale 주석 참조).
        className="h-full w-full overflow-hidden rounded-lg bg-white">
        <View
          style={{height: THUMB_HEIGHT}}
          className="w-full overflow-hidden bg-gray-50">
          <View className="absolute top-0 left-0 z-10 h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-fixed-900">
            <Text className="text-primary-500 text-sm font-medium">{rank}</Text>
          </View>
          <Thumbnail
            uri={product.thumbnail}
            categoryId={product.categoryId}
            type="product"
          />
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
});

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
