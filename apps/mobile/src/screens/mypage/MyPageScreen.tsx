import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {pageHeader, text} from '@jirum/design-system/recipes';
import {
  CUSTOMER_SERVICE_TITLE,
  MYPAGE_GROUPS,
  mobileMenuOf,
  type MypageMobileMenuKey,
} from '@jirum/domain/mypage';
import {cn} from '@/shared/lib/styling/className';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import Constants from 'expo-constants';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {MyPageQueries} from '@/entities/mypage';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import {useRegisterScrollToTop} from '@/navigations/tab/scroll-to-top-store';
import ArrowRight from '@/shared/components/icons/ArrowRight';
import Heart from '@/shared/components/icons/Heart';
import Thumbsup from '@/shared/components/icons/Thumbsup';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import {reviewUrl} from '@/shared/lib/update/release-policy';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {MenuGroup, MenuRow} from '@/features/mypage/ui/Rows';
import CustomerServiceSheet from '@/features/mypage/ui/CustomerServiceSheet';
import ColorSchemeSheet from '@/features/mypage/ui/ColorSchemeSheet';
import {
  DescriptionMenuIcon,
  FilterMenuIcon,
  GridMenuIcon,
  HashtagMenuIcon,
  HeadsetMenuIcon,
  HelpMenuIcon,
  ThemeMenuIcon,
} from '@/features/mypage/ui/icons';
import {useColors} from '@/shared/theme/useColors';
import {HELP_PATH} from '@/constants/env';
import {useAuth} from '@/entities/auth/useAuth';
import {useOpenLogin} from '@/shared/hooks/useRequireLogin';
import {
  COLOR_SCHEME_LABEL,
  useColorSchemePreference,
} from '@/shared/theme/color-scheme-preference';

/**
 * 내정보 탭 루트. web `/mypage`(BasicLayout + MyProfileSection + MenuList) 대응.
 *
 * ★web 의 `Suspense` + 서버 prefetch 는 옮길 게 없다(RN 엔 서버가 없다).
 * 대신 **web 에 없던 로딩·에러 상태를 직접 그린다** — 프로필이 늦게 와도
 * 메뉴는 먼저 쓸 수 있어야 하므로 프로필 블록만 상태를 가른다.
 */
export default function MyPageScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<TabStackParamList>>();
  const [isCustomerServiceOpen, setCustomerServiceOpen] = useState(false);
  const [isColorSchemeOpen, setColorSchemeOpen] = useState(false);
  const [colorScheme, setColorScheme] = useColorSchemePreference();

  const {data: me, isPending, isError, refetch} = useQuery(MyPageQueries.me());
  // 게스트(로그인 없이 알림만 받는 기기 계정) — 프로필 자리에 로그인 권유, 계정이 있어야 되는 메뉴는 로그인으로.
  const {isGuest} = useAuth();
  const leaveGuest = useOpenLogin();
  const {refreshing, onRefresh} = usePullRefresh(refetch);

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
        | typeof tabStackNavigations.MYPAGE_NOTIFICATION
        | typeof tabStackNavigations.MYPAGE_TERMS
        | typeof tabStackNavigations.LIKE
        | typeof tabStackNavigations.DESIGN_SYSTEM,
    ) => {
      navigation.push(screen);
    },
    [navigation],
  );

  /**
   * 정본 메뉴 키 → 앱 아이콘·이동. `Record` 라 정본에 메뉴가 늘면 여기서 타입체크가 막는다
   * (web 에만 메뉴가 생기는 «안 옮김»을 컴파일이 잡는다).
   */
  const appMenu: Record<
    MypageMobileMenuKey,
    {icon: React.ReactNode; onPress: () => void; hidden?: boolean}
  > = {
    like: {
      icon: <Heart width={24} height={24} />,
      onPress: () => (isGuest ? leaveGuest() : push(tabStackNavigations.LIKE)),
    },
    keyword: {
      icon: <HashtagMenuIcon />,
      onPress: () => push(tabStackNavigations.MYPAGE_KEYWORD),
    },
    // 관심 카테고리는 회원 프로필(favoriteCategories)에 저장돼 게스트는 못 바꾼다.
    categories: {
      icon: <GridMenuIcon />,
      onPress: () => push(tabStackNavigations.MYPAGE_CATEGORIES),
      hidden: isGuest,
    },
    notification: {
      icon: <FilterMenuIcon />,
      onPress: () => push(tabStackNavigations.MYPAGE_NOTIFICATION),
    },
    // 본문은 web /help(약관과 같은 방식 — 정본 하나, 고칠 때 OTA·스토어 불필요).
    help: {
      icon: <HelpMenuIcon />,
      onPress: () =>
        navigation.push(tabStackNavigations.WEBVIEW, {
          uri: HELP_PATH,
          title: '사용법 · 자주 묻는 질문',
        }),
    },
    terms: {
      icon: <DescriptionMenuIcon />,
      onPress: () => push(tabStackNavigations.MYPAGE_TERMS),
    },
  };

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* 헤더 — web BasicLayout title="마이페이지"(뒤로가기 없음). web 처럼 제목 왼쪽 — 예전엔 앱만 가운데였다. */}
      <View
        className={cn(
          'justify-center',
          pageHeader.bar,
          pageHeader.height,
          pageHeader.border,
        )}>
        <Text className={pageHeader.title}>마이페이지</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{
          paddingBottom: getReservedBottomPx(insets.bottom),
        }}>
        {/* 프로필 — web MyProfileSection. 누르면 가입 정보. */}
        <View className="px-5">
          {/*
            ★구분선을 한 종류로 맞춘다. 예전엔 프로필 아래가
            `border-b-2 border-gray-600`(2px 진회색), 메뉴 아래가
            `border-b border-gray-300`(1px) 이라 같은 화면에 두 굵기가 섞였다.
          */}
          <View className="border-b border-gray-200 py-8">
            {isGuest ? (
              <Pressable
                onPress={leaveGuest}
                accessibilityRole="button"
                accessibilityLabel="로그인하고 계정에 저장"
                android_ripple={{color: c.gray[100]}}
                style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
                <View className="flex-row items-center justify-between">
                  <View className="min-w-0" style={styles.grow}>
                    <Text className="text-lg font-bold text-gray-900">
                      로그인하고 계정에 저장
                    </Text>
                    <Text className={text.caption}>
                      키워드 알림은 지금도 받고 있어요. 로그인하면 계정으로
                      옮겨져요
                    </Text>
                  </View>
                  <ArrowRight />
                </View>
              </Pressable>
            ) : isError ? (
              <SectionErrorRow label="내 정보" onRetry={refetch} />
            ) : isPending ? (
              <View className="h-14 justify-center">
                <ActivityIndicator size="small" className="text-gray-500" />
              </View>
            ) : (
              <Pressable
                onPress={() => push(tabStackNavigations.MYPAGE_ACCOUNT)}
                accessibilityRole="button"
                accessibilityLabel="가입 정보"
                android_ripple={{color: c.gray[100]}}
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
                    <Text className={text.caption} numberOfLines={1}>
                      {me?.email}
                    </Text>
                  </View>
                  <ArrowRight />
                </View>
              </Pressable>
            )}
          </View>
        </View>

        {/* 메뉴 — 항목·이름·묶음·순서는 @jirum/domain/mypage(web 목록·PC 사이드바와 같은 정본).
            여기선 키마다 아이콘·이동만 붙인다. 앱에만 있는 줄(화면 모드·앱 평가하기)은 묶음 끝. */}
        <View className="gap-4 px-5 py-4">
          {MYPAGE_GROUPS.map(group => (
            <MenuGroup key={group.key} label={group.label}>
              {mobileMenuOf(group.key).map(item => {
                const row = appMenu[item.key];
                return row.hidden ? null : (
                  <MenuRow
                    key={item.key}
                    icon={row.icon}
                    title={item.title}
                    onPress={row.onPress}
                  />
                );
              })}
              {group.key === 'custom' && (
                <MenuRow
                  icon={<ThemeMenuIcon />}
                  title="화면 모드"
                  value={COLOR_SCHEME_LABEL[colorScheme]}
                  onPress={() => setColorSchemeOpen(true)}
                />
              )}
              {group.key === 'support' && (
                <>
                  <MenuRow
                    icon={<HeadsetMenuIcon />}
                    title={CUSTOMER_SERVICE_TITLE}
                    onPress={() => setCustomerServiceOpen(true)}
                  />
                  <MenuRow
                    icon={<Thumbsup width={24} height={24} />}
                    title="앱 평가하기"
                    onPress={() => Linking.openURL(reviewUrl()).catch(() => {})}
                  />
                  {/* 개발 빌드에서만 — 운영은 딥링크 jirumalarm://design-system 으로 연다. */}
                  {__DEV__ ? (
                    <MenuRow
                      icon={<GridMenuIcon />}
                      title="디자인 시스템(개발)"
                      onPress={() => push(tabStackNavigations.DESIGN_SYSTEM)}
                    />
                  ) : null}
                </>
              )}
            </MenuGroup>
          ))}
          <Text className={text.caption}>
            앱 버전 {Constants.expoConfig?.version}
          </Text>
        </View>
      </ScrollView>

      <ColorSchemeSheet
        visible={isColorSchemeOpen}
        value={colorScheme}
        onChange={setColorScheme}
        onClose={() => setColorSchemeOpen(false)}
      />
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
