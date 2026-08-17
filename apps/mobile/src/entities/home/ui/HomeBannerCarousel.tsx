import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Text,
  View,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useQuery} from '@tanstack/react-query';

import PressableScale from '@/shared/components/PressableScale';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {AdvertiseSlotLocation} from '@/shared/api/gql/graphql';
import {LANDING_URL} from '@/constants/env';

import {HomeQueries} from '../api/home.queries';
import {useAdTracking} from '../lib/useAdTracking';

/**
 * 홈 상단 다크 헤더의 배너 캐러셀. web: widgets/home/ui/mobile/BannerSwiper.tsx
 *
 * ★ 라이브러리를 쓰지 않는다(계획서 §7 결정).
 * web 이 실제로 쓰는 swiper 기능은 loop + autoplay + centeredSlides 뿐이고,
 * 그건 ScrollView + setInterval + snapToInterval 로 충분하다.
 * reanimated-carousel 은 worklets 0.5.1 핀 환경이라 버전 리스크가 실재한다
 * (victory-native 가 그래서 막혔다).
 *
 * ★ 앱 분기: web 은 `device.isJirumAlarmApp` 이면 앱 다운로드 배너를 뺀다.
 * 네이티브는 항상 앱이므로 그 분기의 앱 쪽만 남긴다 → 카톡·소개 링크만.
 *
 * ★ 광고 슬롯은 유지한다(애드센스와 다른 시스템). 노출 집계는 useAdTracking 이
 * onViewableItemsChanged 대신 스크롤 위치로 판정한다 — ScrollView 라 뷰포트
 * 계산이 단순하다.
 */

const AUTOPLAY_MS = 5000; // web autoplay.delay
const AD_AUTOPLAY_MS = 6000; // web data-swiper-autoplay="6000"
const BANNER_HEIGHT = 92; // web h-[92px]
const REPEAT = 3; // web: 앱 분기에서 카톡/소개를 3회 반복

type BannerSlide =
  | {kind: 'kakao'}
  | {kind: 'about'}
  | {
      kind: 'ad';
      creativeId: number;
      title: string;
      targetUrl: string;
      imageUrl?: string;
    };

export default function HomeBannerCarousel() {
  const {data: ads} = useQuery(
    HomeQueries.activeAds(AdvertiseSlotLocation.HomeCarouselBanner),
  );

  const slides = useMemo<BannerSlide[]>(() => {
    const adSlides: BannerSlide[] = (ads ?? []).map(ad => ({
      kind: 'ad' as const,
      creativeId: Number(ad.id),
      title: ad.displayTitle ?? ad.internalId,
      targetUrl: ad.targetUrl,
      imageUrl: parseGraphicImage(ad.graphic),
    }));

    const rest: BannerSlide[] = [];
    for (let i = 0; i < REPEAT; i++) {
      rest.push({kind: 'kakao'}, {kind: 'about'});
    }
    return [...adSlides, ...rest];
  }, [ads]);

  return <BannerPager slides={slides} />;
}

function BannerPager({slides}: {slides: BannerSlide[]}) {
  const screenWidth = Dimensions.get('window').width;
  // web: style width 'calc(100% - 50px)' + centeredSlides + spaceBetween 12
  const slideWidth = screenWidth - 50;
  const GAP = 12;
  const step = slideWidth + GAP; // 스냅 간격은 간격까지 포함해야 어긋나지 않는다
  const sidePadding = (screenWidth - slideWidth) / 2;

  const count = slides.length;

  /**
   * ★web `loop: true` 구현. 앞뒤로 한 벌씩 덧대고(=3배) 가운데 블록에서 시작한다.
   *
   * 인덱스만 `% count` 로 순환시키면 마지막 → 첫 슬라이드에서 scrollTo(0) 이라
   * 오른쪽으로 계속 도는 대신 **왼쪽으로 확 되감긴다** — 무한 롤링이 아니다
   * (사용자 지적). 실제 슬라이드를 복제해 두고, 가장자리에 닿으면 같은 배너가
   * 보이는 가운데 위치로 애니메이션 없이 점프한다(랭킹 슬라이더와 같은 방식).
   */
  const looped = useMemo(
    () =>
      count === 0
        ? []
        : Array.from({length: count * 3}, (_, i) => ({
            slide: slides[i % count],
            realIndex: i % count,
            key: `${slides[i % count].kind}-${i}`,
          })),
    [slides, count],
  );

  const scrollRef = useRef<Animated.ScrollView>(null);
  // 가운데 블록 기준 위치.
  const [scrollIndex, setScrollIndex] = useState(count);
  const indexRef = useRef(count);
  const interactedRef = useRef(false);
  const progress = useSharedValue(0);

  const index = count > 0 ? scrollIndex % count : 0;
  const currentDelay =
    slides[index]?.kind === 'ad' ? AD_AUTOPLAY_MS : AUTOPLAY_MS;

  // 첫 로드 시 가운데 블록으로.
  useEffect(() => {
    if (count === 0) return;
    indexRef.current = count;
    setScrollIndex(count);
    scrollRef.current?.scrollTo({x: count * step, animated: false});
  }, [count, step]);

  const goTo = useCallback(
    (next: number) => {
      indexRef.current = next;
      setScrollIndex(next);
      scrollRef.current?.scrollTo({x: next * step, animated: true});
    },
    [step],
  );

  /**
   * autoplay. web 은 disableOnInteraction:false 라 만져도 계속 도는데,
   * RN 에선 손으로 넘기는 중에 자동으로 튀면 성가시다 —
   * 사용자가 한 번 만지면 잠시 멈췄다가 다음 tick 부터 재개한다.
   */
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (interactedRef.current) {
        interactedRef.current = false;
        return;
      }
      goTo(indexRef.current + 1);
    }, currentDelay);
    return () => clearInterval(timer);
  }, [count, currentDelay, goTo]);

  // web 의 진행바(onAutoplayTimeLeft → --progress)
  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {duration: currentDelay});
  }, [index, currentDelay, progress]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (count === 0) return;
    const next = Math.round(e.nativeEvent.contentOffset.x / step);
    indexRef.current = next;
    setScrollIndex(next);

    // 가장자리 블록이면 같은 배너가 보이는 가운데로 순간이동.
    // 스크롤이 멈춘 뒤라 사용자는 점프를 느끼지 못한다.
    if (next < count || next >= count * 2) {
      const middle = count + (((next % count) + count) % count);
      indexRef.current = middle;
      setScrollIndex(middle);
      scrollRef.current?.scrollTo({x: middle * step, animated: false});
    }
  };

  if (count === 0) return null;

  return (
    <View>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={step}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => {
          interactedRef.current = true;
        }}
        onMomentumScrollEnd={onMomentumEnd}
        contentContainerStyle={{paddingHorizontal: sidePadding, gap: GAP}}>
        {looped.map((item, i) => (
          <View key={item.key} style={{width: slideWidth}}>
            <BannerSlideView slide={item.slide} isVisible={i === scrollIndex} />
            {/*
              진행바는 슬라이드 안에 둔다 — 배너와 같이 움직여야 한다.
              web 은 캐러셀 컨테이너에 absolute 로 붙여 화면에 고정하는데,
              그러면 스크롤 중 배너만 지나가고 바는 제자리라 따로 논다.
              활성 슬라이드에만 그려서 "지금 이 배너의 남은 시간"으로 읽히게 한다.
            */}
            {i === scrollIndex ? (
              <View className="absolute top-2 right-3 h-1 w-8">
                <View className="h-full w-full overflow-hidden rounded-full bg-white/20">
                  <Animated.View
                    className="h-full bg-white"
                    style={progressStyle}
                  />
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const KAKAO_IMAGE = require('@/shared/assets/kakao.png') as ImageSourcePropType;
const LANDING_IMAGE =
  require('@/shared/assets/landing.png') as ImageSourcePropType;
const KAKAO_OPEN_CHAT_URL = 'https://open.kakao.com/o/gJZTWAAg';

function BannerSlideView({
  slide,
  isVisible,
}: {
  slide: BannerSlide;
  isVisible: boolean;
}) {
  const {recordImpression, recordClick} = useAdTracking();

  // 광고 노출 집계: 화면에 보이는 슬라이드만 1회.
  // web 은 useInView({threshold:0.5, triggerOnce:true}) — 같은 의미다.
  useEffect(() => {
    if (slide.kind === 'ad' && isVisible) {
      recordImpression(slide.creativeId);
    }
  }, [slide, isVisible, recordImpression]);

  if (slide.kind === 'ad') {
    return (
      <BannerCard
        title={slide.title}
        description="자세히 보기"
        image={slide.imageUrl ? {uri: slide.imageUrl} : LANDING_IMAGE}
        backgroundClassName="bg-gray-800 border-gray-600"
        isAd
        onPress={() => {
          recordClick(slide.creativeId);
          openInAppBrowser(slide.targetUrl);
        }}
      />
    );
  }

  if (slide.kind === 'kakao') {
    return (
      <BannerCard
        title="핫딜 전용 카톡방 "
        strongTitle="OPEN"
        description="오픈 카톡방에서 소식을 확인해보세요!"
        image={KAKAO_IMAGE}
        backgroundClassName="bg-gray-800 border-gray-600"
        onPress={() => openInAppBrowser(KAKAO_OPEN_CHAT_URL)}
      />
    );
  }

  return (
    <BannerCard
      title="지름알림, "
      strongTitle="어떻게 쓰나요?"
      description="소개 페이지에서 한 눈에 알아보세요!"
      image={LANDING_IMAGE}
      backgroundClassName="bg-[#193E21] border-[#34673C]"
      onPress={() => openInAppBrowser(LANDING_URL)}
    />
  );
}

/** web BannerItem — h-[92px], 제목 흰색 bold(strong 은 primary-300), 설명 13px gray-200. */
function BannerCard({
  title,
  strongTitle,
  description,
  image,
  backgroundClassName,
  isAd,
  onPress,
}: {
  title: string;
  strongTitle?: string;
  description: string;
  image: ImageSourcePropType;
  backgroundClassName: string;
  isAd?: boolean;
  onPress: () => void;
}) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}${strongTitle ?? ''} ${description}`}
      style={{height: BANNER_HEIGHT}}
      className={`h-full w-full flex-row items-center justify-between rounded-lg border py-3 pr-1.5 pl-4 ${backgroundClassName}`}>
      <View className="flex-1">
        <Text className="mb-1 font-bold text-white" numberOfLines={1}>
          {title}
          {strongTitle ? (
            <Text className="text-primary-300 font-bold">{strongTitle}</Text>
          ) : null}
        </Text>
        <Text className="text-[13px] text-gray-200" numberOfLines={1}>
          {description}
        </Text>
      </View>

      <View className="h-14 w-20 items-center justify-center">
        <Image
          source={image}
          style={{width: 80, height: 56}}
          resizeMode="contain"
        />
      </View>

      {isAd ? (
        <View className="absolute right-2 bottom-2 rounded-lg border border-white bg-[#98A2B3] px-[7px] py-[3px]">
          {/* web `leading-none` — 기본 line-height 면 뱃지가 4~6px 커진다. */}
          <Text
            className="text-xs font-medium text-white"
            style={{lineHeight: 12}}>
            AD
          </Text>
        </View>
      ) : null}
    </PressableScale>
  );
}

/**
 * 광고 크리에이티브의 graphic(JSON) 에서 이미지 URL 을 꺼낸다.
 * web 은 AdvertiseGraphic 이 도형까지 그리지만, 앱은 이미지 한 장으로 축약한다 —
 * 도형 DSL(advertise-graphic.ts 140줄)까지 옮길 만큼 쓰이지 않는다.
 * ponytail: 이미지만. 도형 광고가 실제로 들어오면 그때 확장.
 */
function parseGraphicImage(graphic: unknown): string | undefined {
  if (!graphic) return undefined;
  try {
    const parsed =
      typeof graphic === 'string' ? JSON.parse(graphic) : (graphic as object);
    const found = findFirstImageUrl(parsed);
    return found;
  } catch {
    return undefined;
  }
}

function findFirstImageUrl(node: unknown): string | undefined {
  if (typeof node === 'string') {
    return /^https?:\/\/.+\.(png|jpe?g|webp|gif)/i.test(node)
      ? node
      : undefined;
  }
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findFirstImageUrl(child);
      if (found) return found;
    }
    return undefined;
  }
  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) {
      const found = findFirstImageUrl(value);
      if (found) return found;
    }
  }
  return undefined;
}
