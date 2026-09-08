import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/navigations/tab/types';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import {useRegisterScrollToTop} from '@/navigations/tab/scroll-to-top-store';
import ArrowRight from '@/shared/components/icons/ArrowRight';
import Heart from '@/shared/components/icons/Heart';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {HEADER_HEIGHT} from '@/features/mypage/ui/StackHeader';
import {MenuRow} from '@/features/mypage/ui/Rows';
import CustomerServiceSheet from '@/features/mypage/ui/CustomerServiceSheet';
import {
  AlertMenuIcon,
  DescriptionMenuIcon,
  FilterMenuIcon,
  HeadsetMenuIcon,
} from '@/features/mypage/ui/icons';

/**
 * 내정보 탭 루트. web `/mypage`(BasicLayout + MyProfileSection + MenuList) 대응.
 *
 * ★web 의 `Suspense` + 서버 prefetch 는 옮길 게 없다(RN 엔 서버가 없다).
 * 대신 **web 에 없던 로딩·에러 상태를 직접 그린다** — 프로필이 늦게 와도
 * 메뉴는 먼저 쓸 수 있어야 하므로 프로필 블록만 상태를 가른다.
 */
export default function MyPageScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<TabStackParamList>>();
  const [isCustomerServiceOpen, setCustomerServiceOpen] = useState(false);

  const {data: me, isPending, isError, refetch} = useQuery(MyPageQueries.me());

  // 탭 재탭 → 맨 위로. 웹뷰 시절 injectJavaScript 를 대체한다(런북 ② 경로).
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({y: 0, animated: true});
  }, []);
  useRegisterScrollToTop(tabNavigations.MYPAGE, scrollToTop);

  /**
   * 파라미터 없는 하위 화면으로 이동. 다섯 화면이 모두 `undefined` 파라미터라
   * 한 함수로 묶는다 — 유니온으로 좁혀 `as never` 같은 탈출구를 안 쓴다.
   */
  const push = useCallback(
    (
      screen:
        | typeof tabStackNavigations.MYPAGE_ACCOUNT
        | typeof tabStackNavigations.MYPAGE_CATEGORIES
        | typeof tabStackNavigations.MYPAGE_KEYWORD
        | typeof tabStackNavigations.MYPAGE_TERMS
        | typeof tabStackNavigations.LIKE,
    ) => {
      navigation.push(screen);
    },
    [navigation],
  );

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* 헤더 — web BasicLayout title="마이페이지"(뒤로가기 없음) */}
      <View
        className="items-center justify-center border-b border-gray-100 bg-white px-5"
        style={{height: HEADER_HEIGHT}}>
        <Text className="text-lg font-semibold text-gray-900">마이페이지</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          paddingBottom: getReservedBottomPx(insets.bottom),
        }}>
        {/* 프로필 — web MyProfileSection. 누르면 가입 정보. */}
        <View className="px-5">
          <View className="border-b-2 border-gray-600 py-8">
            {isError ? (
              <SectionErrorRow label="내 정보" onRetry={refetch} />
            ) : isPending ? (
              <View className="h-14 justify-center">
                <ActivityIndicator size="small" color="#667085" />
              </View>
            ) : (
              <Pressable
                onPress={() => push(tabStackNavigations.MYPAGE_ACCOUNT)}
                accessibilityRole="button"
                accessibilityLabel="가입 정보"
                android_ripple={{color: '#F2F4F7'}}
                style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
                <View className="flex-row items-center justify-between">
                  <View className="min-w-0" style={styles.grow}>
                    <Text
                      className="text-lg font-bold text-gray-900"
                      numberOfLines={1}>
                      {me?.nickname}
                    </Text>
                    {/*
                      web 은 text-gray-400 인데 명암비 2.58:1 로 WCAG AA 미달이다.
                      보조 라벨은 gray-500 을 쓴다(gray-400-text-fails-wcag-aa).
                    */}
                    <Text className="text-xs text-gray-500" numberOfLines={1}>
                      {me?.email}
                    </Text>
                  </View>
                  <ArrowRight />
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* 메뉴 — web MenuList(찜 목록 · 관심 카테고리 · 키워드 알림 · 약관 · 고객센터) */}
        <View className="px-5">
          <View className="border-b border-gray-300 py-4">
            <MenuRow
              icon={<Heart width={24} height={24} />}
              title="찜 목록"
              onPress={() => push(tabStackNavigations.LIKE)}
            />
            <MenuRow
              icon={<FilterMenuIcon />}
              title="관심 카테고리"
              onPress={() => push(tabStackNavigations.MYPAGE_CATEGORIES)}
            />
            <MenuRow
              icon={<AlertMenuIcon />}
              title="키워드 알림"
              onPress={() => push(tabStackNavigations.MYPAGE_KEYWORD)}
            />
            <MenuRow
              icon={<DescriptionMenuIcon />}
              title="약관 및 정책"
              onPress={() => push(tabStackNavigations.MYPAGE_TERMS)}
            />
            <MenuRow
              icon={<HeadsetMenuIcon />}
              title="고객센터"
              onPress={() => setCustomerServiceOpen(true)}
            />
          </View>
        </View>
      </ScrollView>

      <CustomerServiceSheet
        visible={isCustomerServiceOpen}
        onClose={() => setCustomerServiceOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grow: {flex: 1},
});
