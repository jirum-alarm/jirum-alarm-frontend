import React, {Fragment, useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
import {buildPromotionSections} from '@/entities/home/model/promotion-sections';
import DynamicProductSection from '@/entities/home/ui/DynamicProductSection';
import HomeBannerCarousel from '@/entities/home/ui/HomeBannerCarousel';
import JirumRankingSlider from '@/entities/home/ui/JirumRankingSlider';
import RecommendedKeywordSection from '@/entities/home/ui/RecommendedKeywordSection';
import TossHomeSection from '@/entities/home/ui/TossHomeSection';
import HomeHeader from '@/screens/home/ui/HomeHeader';
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
import {openInAppBrowser} from '@/shared/lib/navigation';

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

  const [isScrolled, setIsScrolled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {data: tabSources, isPending: isTabSourcesPending} = useQuery(
    HomeQueries.tabSources(),
  );

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
   * 더보기 링크. /curation/* 은 아직 네이티브 화면이 없어 웹뷰로 띄운다.
   * ponytail: 인앱 브라우저. 큐레이션까지 네이티브로 옮기면 그때 push 로 바꾼다.
   */
  const handlePressViewMore = useCallback((link: string) => {
    openInAppBrowser(`${SERVICE_URL}${link}`);
  }, []);

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

  const reservedBottom = getReservedBottomPx(insets.bottom);

  return (
    <View className="flex-1 bg-white">
      {/*
        상단 다크 헤더 위에선 상태바를 밝게. web 웹뷰 시절엔 TabWebView 의
        handleScrollForHomeStatusBar 가 하던 일이라 네이티브에서 직접 배선한다
        (안 하면 다크 헤더에서 상태바가 안 보인다).
      */}
      <SystemBars style={isScrolled ? 'dark' : 'light'} hidden={false} />

      <ScrollView
        stickyHeaderIndices={[0]}
        scrollEventThrottle={16}
        onScroll={e => handleScroll(e.nativeEvent.contentOffset.y)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{paddingBottom: reservedBottom}}>
        <HomeHeader isScrolled={isScrolled} />

        {/* 다크 배경 헤더 + 배너 캐러셀 (web BackgroundHeader) */}
        <View className="bg-gray-900 pb-6">
          <HomeBannerCarousel />
        </View>

        {/* 본문 — web 은 rounded-t-[1.25rem] 로 다크 헤더 위에 올라탄다 */}
        <View className="-mt-5 rounded-t-[20px] bg-white pt-3">
          <JirumRankingSlider onPressProduct={handlePressProduct} />
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
                      <TossHomeSection onPressProduct={handlePressProduct} />
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

              <HomeEndCta />
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
function HomeEndCta() {
  const navigation = useNavigation();

  return (
    <View className="items-center gap-y-3 border-t border-gray-100 py-12">
      <Text className="text-sm font-medium text-gray-500">
        추천 핫딜을 모두 확인했어요
      </Text>
      <PressableScale
        onPress={() => {
          // 탭 네비게이터를 id 로 찾아 발견 탭으로. 웹뷰를 새로 띄우면
          // 탭 구조 밖으로 나가버린다.
          const tabs = navigation.getParent(MAIN_TABS_ID as never) as
            | {navigate: (name: string) => void}
            | undefined;
          tabs?.navigate(tabNavigations.DISCOVER);
        }}
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
