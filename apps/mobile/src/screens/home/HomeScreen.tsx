import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';

import {HomeQueries} from '@/entities/home/api/home.queries';
import {AdvertiseSlotLocation} from '@/shared/api/gql/graphql';
import {buildPromotionSections} from '@/entities/home/model/promotion-sections';
import DynamicProductSection from '@/entities/home/ui/DynamicProductSection';
import HomeBannerCarousel from '@/entities/home/ui/HomeBannerCarousel';
import JirumRankingSlider from '@/entities/home/ui/JirumRankingSlider';
import RecommendedKeywordSection from '@/entities/home/ui/RecommendedKeywordSection';
import TossHomeSection from '@/entities/home/ui/TossHomeSection';
import HomeHeader from '@/screens/home/ui/HomeHeader';
import {BannerSkeleton, RankingSkeleton} from '@/screens/home/ui/HomeSkeletons';
import PressableScale from '@/shared/components/PressableScale';
import {ArrowRightIcon} from '@/shared/components/icons';
import {
  MAIN_TABS_ID,
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import {setTabBarVisible} from '@/shared/hooks/useTabBarVisibility';
import type {TabStackParamList} from '@/navigations/tab/types';
import {SERVICE_URL} from '@/constants/env';
import {useWebviewContext} from '@/provider/WebViewRefProvider';

/**
 * 네이티브 홈. web: app/(desktop-ready)/(home)/page.tsx → HomeContainerV2
 *
 * ★ web 은 async 서버 컴포넌트가 checkDevice() + getPromotionSections() +
 * prefetch/dehydrate 를 하지만 RN 엔 서버가 없다. 전부 클라이언트 useQuery 로
 * 내려오고, `isMobile` 은 상수라 데스크톱 분기(`pc:`)가 통째로 사라진다.
 *
 * ★ 섹션 순서는 web PromotionSectionList 와 동일:
 *   [랭킹] → hotdeal(앞에 토스 특가 끼움) → guest-recommended → under-10000
 *   → (키워드 추천) → GROUP(impending·premium) → mall → community → 끝 CTA
 */

type HomeNavigationProp = NativeStackNavigationProp<TabStackParamList>;

/** 인기 키워드 추천 칩을 이 섹션 뒤에 끼운다(web KEYWORD_AFTER_SECTION_ID). */
const KEYWORD_AFTER_SECTION_ID = 'under-10000';

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const {getWebViewRef, setActiveTab} = useWebviewContext();

  const [isScrolled, setIsScrolled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {data: tabSources, isPending: isTabSourcesPending} = useQuery(
    HomeQueries.tabSources(),
  );

  /**
   * ★첫 화면(above-the-fold)은 한번에 그린다.
   *
   * RN 엔 SSR 이 없어서 각 쿼리가 끝나는 대로 UI 가 순차로 바뀐다 — 배너가
   * 뜨고, 랭킹이 뜨고, 섹션이 뜨는 게 다 보여서 "데이터 페칭 후 UI 가 바뀐다"로
   * 읽힌다(사용자 지적).
   *
   * 화면에 처음 보이는 건 배너 + 랭킹뿐이므로 **그 둘만** 기다렸다가 함께
   * 보여준다. 아래 섹션은 스크롤해야 보이므로 각자 채워도 짤깁임이 안 보인다.
   * (전체를 기다리면 가장 느린 섹션이 첫 화면 속도를 정해 오히려 느려진다.)
   */
  const {isPending: isRankingPending} = useQuery(HomeQueries.ranking());
  const {isPending: isAdsPending} = useQuery(
    HomeQueries.activeAds(AdvertiseSlotLocation.HomeCarouselBanner),
  );
  const isAboveFoldPending = isRankingPending || isAdsPending;

  /**
   * 섹션 구성. 탭 소스가 아직 없으면 빈 배열로 만들어 키워드 폴백 탭을 쓴다
   * (web 의 Promise.allSettled 실패 경로와 같은 결과).
   */
  const sections = useMemo(
    () =>
      buildPromotionSections({
        communityProviders: tabSources?.communityProviders ?? [],
        mallGroups: tabSources?.mallGroups ?? [],
      }),
    [tabSources],
  );

  const handlePressProduct = useCallback(
    (id: number) => {
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`});
    },
    [navigation],
  );

  /**
   * 섹션 더보기(/curation/*). 네이티브 화면이 아직 없어 웹으로 보여주되,
   * **탭 스택에 쌓는다** — 인앱 브라우저로 띄우면 앱 밖으로 나간 것처럼 보이고
   * 탭바·뒤로가기가 사라진다(사용자 지적).
   */
  const handlePressViewMore = useCallback(
    (link: string, title: string) => {
      navigation.push(tabStackNavigations.WEBVIEW, {
        uri: `${SERVICE_URL}${link}`,
        title,
      });
    },
    [navigation],
  );

  /**
   * "실시간 특가 더 보기" → 발견 탭의 **실시간** 화면.
   *
   * 탭만 바꾸면 그 탭의 기본 URL(`/trending/ranking`)이라 랭킹이 뜬다
   * (사용자 지적). 탭을 전환하고 그 탭 웹뷰의 URL 을 live 로 갈아끼운다 —
   * MainTabNavigator 의 handleNavigateToRoot 와 같은 방식.
   */
  const handlePressLiveDeals = useCallback(() => {
    const tabs = navigation.getParent(MAIN_TABS_ID as never) as
      | {navigate: (name: string) => void}
      | undefined;
    tabs?.navigate(tabNavigations.DISCOVER);
    setActiveTab(tabNavigations.DISCOVER);

    const target = `${SERVICE_URL}/trending/live`;
    // 탭 전환 직후엔 웹뷰가 아직 마운트 전일 수 있어 한 틱 뒤에 주입한다.
    setTimeout(() => {
      getWebViewRef(tabNavigations.DISCOVER)?.current?.injectJavaScript(
        `if (window.location.href !== '${target}') { window.location.href = '${target}'; } true;`,
      );
    }, 0);
  }, [navigation, setActiveTab, getWebViewRef]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({queryKey: HomeQueries.keys.all});
    setRefreshing(false);
  }, [queryClient]);

  // web HomeHeader: 스크롤 90px 넘으면 흰 헤더가 내려온다.
  const handleScroll = useCallback(
    (y: number) => {
      if (y > 90 && !isScrolled) setIsScrolled(true);
      else if (y <= 90 && isScrolled) setIsScrolled(false);
    },
    [isScrolled],
  );

  /**
   * ★탭바 표시는 전역 상태다. 웹뷰 탭이 상세로 들어가며 꺼둔 채로 홈에 오면
   * 네이티브 홈은 onNavigationStateChange 를 안 쏘므로 영영 숨은 채 남는다
   * (웹뷰 시절엔 TabWebView 의 useEffect 가 URL 로 되살렸다).
   * 홈은 항상 탭 루트이므로 포커스될 때마다 켠다.
   */
  useFocusEffect(
    useCallback(() => {
      setTabBarVisible(true);
    }, []),
  );

  // 헤더 크로스페이드(300ms)의 중간에 상태바를 바꾼다. SystemBars 는 애니메이션이
  // 안 되므로, 즉시 바꾸면 아직 다크 헤더인데 글씨가 검어 안 보이고,
  // 끝나고 바꾸면 흰 헤더에 흰 글씨가 된다.
  const [statusBarStyle, setStatusBarStyle] = useState<'light' | 'dark'>(
    isScrolled ? 'dark' : 'light',
  );
  useEffect(() => {
    const timer = setTimeout(
      () => setStatusBarStyle(isScrolled ? 'dark' : 'light'),
      150,
    );
    return () => clearTimeout(timer);
  }, [isScrolled]);

  const reservedBottom = getReservedBottomPx(insets.bottom);

  return (
    <View className="flex-1 bg-white">
      {/*
        상단 다크 헤더 위에선 상태바를 밝게. web 웹뷰 시절엔 TabWebView 의
        handleScrollForHomeStatusBar 가 하던 일이라 네이티브에서 직접 배선한다
        (안 하면 다크 헤더에서 상태바가 안 보인다).
      */}
      <SystemBars style={statusBarStyle} hidden={false} />

      <ScrollView
        stickyHeaderIndices={[0]}
        scrollEventThrottle={16}
        onScroll={e => handleScroll(e.nativeEvent.contentOffset.y)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{paddingBottom: reservedBottom}}>
        <HomeHeader isScrolled={isScrolled} />

        {/*
          다크 배경 헤더 + 배너 캐러셀 (web BackgroundHeader).
          위 여백: web 은 헤더가 py-3 뒤 배너가 바로 오지만, 네이티브는 헤더가
          sticky 라 붙어 보인다 → pt-2 로 숨통을 준다.
          아래 여백: 본문이 -mt-5(20px)로 올라타므로 그만큼 더 준다.
          pb-6(24px)만 주면 실제로 4px 만 남아 배너가 흰 면에 닿는다.
        */}
        <View className="bg-gray-900 pt-2 pb-11">
          {isAboveFoldPending ? <BannerSkeleton /> : <HomeBannerCarousel />}
        </View>

        {/* 본문 — web 은 rounded-t-[1.25rem] 로 다크 헤더 위에 올라탄다 */}
        <View className="-mt-5 rounded-t-[20px] bg-white pt-3">
          {/* web mobile/JirumRankingContainer — 제목 + 더보기(/trending/ranking).
              슬라이더만 옮기고 이 헤더를 빠뜨렸었다. */}
          <View
            className="h-14 w-full flex-row items-center justify-between"
            style={{paddingHorizontal: 20}}>
            <Text className="text-lg font-bold text-gray-900">
              지름알림 랭킹
            </Text>
            <Pressable
              onPress={() =>
                handlePressViewMore('/trending/ranking', '지름알림 랭킹')
              }
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="지름알림 랭킹 더보기">
              <Text className="text-sm text-gray-500">더보기</Text>
            </Pressable>
          </View>
          {isAboveFoldPending ? (
            <RankingSkeleton />
          ) : (
            <JirumRankingSlider onPressProduct={handlePressProduct} />
          )}
          <View className="h-5" />

          {isTabSourcesPending ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator size="small" color="#667085" />
            </View>
          ) : (
            <View style={{gap: 32, paddingVertical: 24}}>
              {sections.map(section => {
                if (section.type === 'GROUP') {
                  return (
                    <Fragment key={section.id}>
                      <View style={{gap: 32}}>
                        {section.sections.map(sub => (
                          <DynamicProductSection
                            key={sub.id}
                            section={sub}
                            onPressProduct={handlePressProduct}
                            onPressViewMore={handlePressViewMore}
                          />
                        ))}
                      </View>
                    </Fragment>
                  );
                }

                return (
                  <Fragment key={section.id}>
                    {/* web: hotdeal 섹션 앞에 토스 특가를 끼운다 */}
                    {section.id === 'hotdeal' && (
                      <TossHomeSection
                        onPressProduct={handlePressProduct}
                        onPressViewMore={handlePressViewMore}
                      />
                    )}
                    <DynamicProductSection
                      section={section}
                      onPressProduct={handlePressProduct}
                      onPressViewMore={handlePressViewMore}
                    />
                    {section.id === KEYWORD_AFTER_SECTION_ID && (
                      <RecommendedKeywordSection />
                    )}
                  </Fragment>
                );
              })}

              <HomeEndCta onPress={handlePressLiveDeals} />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * 목록 끝 CTA. web HomeEndCta.
 * 실시간 특가(/trending/live)는 발견 탭 소속이라 그 탭으로 보낸다 —
 * 웹뷰를 새로 띄우면 탭 구조 밖으로 나가버린다.
 */
function HomeEndCta({onPress}: {onPress: () => void}) {
  return (
    <View className="items-center gap-y-3 border-t border-gray-100 py-12">
      <Text className="text-sm font-medium text-gray-500">
        추천 핫딜을 모두 확인했어요
      </Text>
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="실시간 특가 더 보기"
        className="bg-secondary-600 flex-row items-center gap-x-1 rounded-full px-6 py-3">
        <Text className="text-sm font-semibold text-white">
          실시간 특가 더 보기
        </Text>
        <ArrowRightIcon color="#ffffff" width={16} height={16} />
      </PressableScale>
    </View>
  );
}
