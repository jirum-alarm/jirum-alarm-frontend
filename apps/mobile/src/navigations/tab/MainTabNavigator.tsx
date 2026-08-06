import React, {useCallback, useEffect, useRef} from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {tabNavigations} from '@/shared/constant/navigations';
import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {useHasNewAlarm} from '@/shared/hooks/useHasNewAlarm';
import {getTabBaseUrl} from '@/shared/lib/navigation/tab-routing';
import {SERVICE_URL} from '@/constants/env';
import TabWebView from '@/screens/tabs/TabWebView';
import {
  HomeIcon,
  HomeFillIcon,
  FindIcon,
  FindFillIcon,
  BubbleChatIcon,
  BubbleChatFillIcon,
  AlertIcon,
  AlertFillIcon,
  MyIcon,
  MyFillIcon,
} from '@/shared/components/icons';
import {Animated, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {GlassView, isLiquidGlassAvailable} from 'expo-glass-effect';
import {useTabBarVisibility} from '@/shared/hooks/useTabBarVisibility';

/** 유리 탭바 높이. iOS 26 탭바는 캡슐형이라 반경은 높이의 절반. */
export const TAB_BAR_HEIGHT = 64;
/** safe-area 가 없는 기기에서 탭바를 바닥에서 띄우는 간격 */
export const GLASS_BOTTOM_GAP = 12;
/** 캡슐 좌우 인셋 — iOS 26 탭바는 화면 폭을 꽉 채우지 않는다 */
const GLASS_SIDE_INSET = 16;

/**
 * 웹 콘텐츠가 탭바에 가리지 않도록 확보해야 할 하단 여백(px).
 *
 * 유리 캡슐은 바닥에서 떠 있어 기존(56 + safe-area)보다 더 차지한다.
 * 폴백(일반 탭바)일 때는 예전 값을 그대로 쓴다.
 */
export function getReservedBottomPx(safeAreaBottom: number): number {
  if (!isLiquidGlassAvailable()) {
    return 56 + (safeAreaBottom > 0 ? safeAreaBottom : 8);
  }
  return (
    TAB_BAR_HEIGHT +
    (safeAreaBottom > 0 ? safeAreaBottom : GLASS_BOTTOM_GAP) +
    GLASS_BOTTOM_GAP
  );
}

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

export type MainTabParamList = {
  [tabNavigations.HOME]: undefined;
  [tabNavigations.DISCOVER]: undefined;
  [tabNavigations.COMMUNITY]: undefined;
  [tabNavigations.ALARM]: undefined;
  [tabNavigations.MYPAGE]: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG = [
  {
    name: tabNavigations.HOME,
    label: '홈',
    icon: HomeIcon,
    activeIcon: HomeFillIcon,
  },
  {
    name: tabNavigations.DISCOVER,
    label: '발견',
    icon: FindIcon,
    activeIcon: FindFillIcon,
  },
  {
    name: tabNavigations.COMMUNITY,
    label: '커뮤니티',
    icon: BubbleChatIcon,
    activeIcon: BubbleChatFillIcon,
  },
  {
    name: tabNavigations.ALARM,
    label: '알림',
    icon: AlertIcon,
    activeIcon: AlertFillIcon,
  },
  {
    name: tabNavigations.MYPAGE,
    label: '내정보',
    icon: MyIcon,
    activeIcon: MyFillIcon,
  },
] as const;

function createTabScreen(tabName: TabName) {
  return function TabScreen() {
    const baseUrl = getTabBaseUrl(tabName);
    return <TabWebView tabName={tabName} baseUrl={baseUrl} />;
  };
}

const HomeScreen = createTabScreen(tabNavigations.HOME);
const DiscoverScreen = createTabScreen(tabNavigations.DISCOVER);
const CommunityScreen = createTabScreen(tabNavigations.COMMUNITY);
const AlarmScreen = createTabScreen(tabNavigations.ALARM);
const MyPageScreen = createTabScreen(tabNavigations.MYPAGE);

const TAB_SCREENS: Record<TabName, React.ComponentType> = {
  [tabNavigations.HOME]: HomeScreen,
  [tabNavigations.DISCOVER]: DiscoverScreen,
  [tabNavigations.COMMUNITY]: CommunityScreen,
  [tabNavigations.ALARM]: AlarmScreen,
  [tabNavigations.MYPAGE]: MyPageScreen,
};

function AnimatedTabBar(props: BottomTabBarProps) {
  const tabBarVisible = useTabBarVisibility();
  const insets = useSafeAreaInsets();
  const bottomGap = insets.bottom > 0 ? insets.bottom : GLASS_BOTTOM_GAP;
  // 유리 탭바는 떠 있으므로 아래 간격까지 더해야 완전히 화면 밖으로 숨는다.
  const hiddenOffset = TAB_BAR_HEIGHT + bottomGap;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: tabBarVisible ? 0 : hiddenOffset,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [tabBarVisible, hiddenOffset, translateY]);

  // iOS 26 미만·안드로이드에서는 GlassView 가 일반 View 로 폴백된다.
  // 그때는 유리가 없으니 기존처럼 꽉 찬 흰 배경 탭바를 그대로 쓴다.
  if (!isLiquidGlassAvailable()) {
    return (
      <Animated.View style={[styles.barWrapper, {transform: [{translateY}]}]}>
        <BottomTabBar {...props} />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.barWrapper,
        styles.glassWrapper,
        {bottom: bottomGap, transform: [{translateY}]},
      ]}>
      <GlassView
        glassEffectStyle="regular"
        isInteractive
        style={[styles.glassBar, {height: TAB_BAR_HEIGHT}]}>
        <BottomTabBar {...props} />
      </GlassView>
    </Animated.View>
  );
}

function MainTabNavigator() {
  const {setActiveTab, getWebViewRef} = useWebviewContext();
  const hasNewAlarm = useHasNewAlarm();
  const insets = useSafeAreaInsets();
  const glassEnabled = isLiquidGlassAvailable();

  const handleScrollToTop = useCallback(
    (tabName: TabName) => {
      const ref = getWebViewRef(tabName);
      ref?.current?.injectJavaScript(
        "window.scrollTo({ top: 0, behavior: 'smooth' }); true;",
      );
    },
    [getWebViewRef],
  );

  const handleNavigateToRoot = useCallback(
    (tabName: TabName) => {
      const ref = getWebViewRef(tabName);
      const baseUrl = `${SERVICE_URL}${getTabBaseUrl(tabName)}`;
      ref?.current?.injectJavaScript(
        `if (window.location.href !== '${baseUrl}') { window.location.href = '${baseUrl}'; } true;`,
      );
    },
    [getWebViewRef],
  );

  return (
    <Tab.Navigator
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#101828',
        tabBarInactiveTintColor: '#667085',
        tabBarLabelStyle: styles.tabBarLabel,
        // 유리를 쓸 땐 안쪽 탭바가 투명해야 뒤가 비친다. 흰 배경·상단 테두리를
        // 그대로 두면 유리를 덮어 그냥 흰 캡슐이 된다.
        // 높이·하단 여백도 유리 캡슐이 대신 잡으므로 여기서는 빼야 이중이 안 된다.
        tabBarStyle: glassEnabled
          ? styles.glassInnerTabBar
          : {
              ...styles.tabBar,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
              height: 56 + (insets.bottom > 0 ? insets.bottom : 8),
            },
        lazy: true,
      }}>
      {TAB_CONFIG.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({focused}) => {
              const IconComponent = focused ? tab.activeIcon : tab.icon;
              return (
                <View style={styles.iconContainer}>
                  <IconComponent
                    width={24}
                    height={24}
                    color={focused ? '#101828' : '#667085'}
                  />
                  {tab.name === tabNavigations.ALARM && hasNewAlarm && (
                    <View style={styles.badgeDot} />
                  )}
                </View>
              );
            },
          }}
          listeners={({navigation}) => ({
            tabPress: _e => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

              const state = navigation.getState();
              const currentRoute = state.routes[state.index];
              const isFocused = currentRoute?.name === tab.name;

              setActiveTab(tab.name);

              if (isFocused) {
                handleScrollToTop(tab.name);
              } else {
                handleNavigateToRoot(tab.name);
              }
            },
          })}
        />
      ))}
    </Tab.Navigator>
  );
}

export default MainTabNavigator;

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  glassWrapper: {
    left: GLASS_SIDE_INSET,
    right: GLASS_SIDE_INSET,
  },
  glassBar: {
    borderRadius: TAB_BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  glassInnerTabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    position: 'relative',
    height: TAB_BAR_HEIGHT,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#D0D5DD',
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 0,
  },
  iconContainer: {
    position: 'relative',
    width: 48,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: 4,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EB001C',
  },
});
