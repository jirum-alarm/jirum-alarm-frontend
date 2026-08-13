import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, Image, Platform, StyleSheet, View} from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBar,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {tabNavigations, MAIN_TABS_ID} from '@/shared/constant/navigations';
import {useWebviewContext} from '@/provider/WebViewRefProvider';
import {useHasNewAlarm} from '@/shared/hooks/useHasNewAlarm';
import {getTabBaseUrl} from '@/shared/lib/navigation/tab-routing';
import {SERVICE_URL} from '@/constants/env';
import {createTabStack} from '@/navigations/tab/TabStackNavigator';
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
import {
  createNativeBottomTabNavigator,
  type NativeTabIcon,
} from '@/navigations/tab/createNativeBottomTabNavigator';
import {
  GLASS_BOTTOM_GAP,
  TAB_BAR_HEIGHT,
} from '@/navigations/tab/tab-bar-metrics';
import {useTabBarVisibility} from '@/shared/hooks/useTabBarVisibility';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

export type MainTabParamList = {
  [tabNavigations.HOME]: undefined;
  [tabNavigations.DISCOVER]: undefined;
  [tabNavigations.COMMUNITY]: undefined;
  [tabNavigations.ALARM]: undefined;
  [tabNavigations.MYPAGE]: undefined;
};

/** iOS 26 시스템 UITabBar(리퀴드 글라스). 그 아래는 JS 탭바. */
function isIos26SystemTabBar(): boolean {
  return (
    Platform.OS === 'ios' && Number.parseFloat(String(Platform.Version)) >= 26
  );
}

const JsTab = createBottomTabNavigator<MainTabParamList>();
const NativeTab = createNativeBottomTabNavigator<MainTabParamList>();

const TAB_CONFIG = [
  {
    name: tabNavigations.HOME,
    label: '홈',
    icon: HomeIcon,
    activeIcon: HomeFillIcon,
    idlePng: require('../../shared/assets/tab-icons/home.png'),
    activePng: require('../../shared/assets/tab-icons/home-fill.png'),
  },
  {
    name: tabNavigations.DISCOVER,
    label: '발견',
    icon: FindIcon,
    activeIcon: FindFillIcon,
    idlePng: require('../../shared/assets/tab-icons/find.png'),
    activePng: require('../../shared/assets/tab-icons/find-fill.png'),
  },
  {
    name: tabNavigations.COMMUNITY,
    label: '커뮤니티',
    icon: BubbleChatIcon,
    activeIcon: BubbleChatFillIcon,
    idlePng: require('../../shared/assets/tab-icons/community.png'),
    activePng: require('../../shared/assets/tab-icons/community-fill.png'),
  },
  {
    name: tabNavigations.ALARM,
    label: '알림',
    icon: AlertIcon,
    activeIcon: AlertFillIcon,
    idlePng: require('../../shared/assets/tab-icons/alert.png'),
    activePng: require('../../shared/assets/tab-icons/alert-fill.png'),
  },
  {
    name: tabNavigations.MYPAGE,
    label: '내정보',
    icon: MyIcon,
    activeIcon: MyFillIcon,
    idlePng: require('../../shared/assets/tab-icons/my.png'),
    activePng: require('../../shared/assets/tab-icons/my-fill.png'),
  },
] as const;

const HomeScreen = createTabStack(tabNavigations.HOME);
const DiscoverScreen = createTabStack(tabNavigations.DISCOVER);
const CommunityScreen = createTabStack(tabNavigations.COMMUNITY);
const AlarmScreen = createTabStack(tabNavigations.ALARM);
const MyPageScreen = createTabStack(tabNavigations.MYPAGE);

const TAB_SCREENS: Record<TabName, React.ComponentType> = {
  [tabNavigations.HOME]: HomeScreen,
  [tabNavigations.DISCOVER]: DiscoverScreen,
  [tabNavigations.COMMUNITY]: CommunityScreen,
  [tabNavigations.ALARM]: AlarmScreen,
  [tabNavigations.MYPAGE]: MyPageScreen,
};

/** 24pt. PNG 픽셀 크기를 그대로 포인트로 쓰면 아이콘이 커진다. */
function nativeTabIcon(source: number): NativeTabIcon {
  const resolved = Image.resolveAssetSource(source);
  return {
    type: 'image',
    source: resolved
      ? {uri: resolved.uri, width: 24, height: 24, scale: 3}
      : source,
    tinted: false,
  };
}

function useTabActions() {
  const {setActiveTab, getWebViewRef} = useWebviewContext();

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

  const onTabPress = useCallback(
    (tabName: TabName, isFocused: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tabName);
      if (isFocused) {
        handleScrollToTop(tabName);
      } else {
        handleNavigateToRoot(tabName);
      }
    },
    [setActiveTab, handleScrollToTop, handleNavigateToRoot],
  );

  return {onTabPress};
}

function AnimatedTabBar(props: BottomTabBarProps) {
  const tabBarVisible = useTabBarVisibility();
  const insets = useSafeAreaInsets();
  const bottomGap = insets.bottom > 0 ? insets.bottom : GLASS_BOTTOM_GAP;
  const hiddenOffset = TAB_BAR_HEIGHT + bottomGap;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: tabBarVisible ? 0 : hiddenOffset,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [tabBarVisible, hiddenOffset, translateY]);

  return (
    <Animated.View style={[styles.barWrapper, {transform: [{translateY}]}]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

function NativeSystemTabNavigator() {
  const hasNewAlarm = useHasNewAlarm();
  const {onTabPress} = useTabActions();

  return (
    <NativeTab.Navigator
      id={MAIN_TABS_ID}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#101828',
        tabBarInactiveTintColor: '#667085',
        tabBarLabelVisibilityMode: 'labeled',
        tabBarMinimizeBehavior: 'onScrollDown',
        overrideScrollViewContentInsetAdjustmentBehavior: false,
        lazy: true,
      }}>
      {TAB_CONFIG.map(tab => (
        <NativeTab.Screen
          key={tab.name}
          name={tab.name}
          component={TAB_SCREENS[tab.name]}
          options={{
            title: tab.label,
            tabBarLabel: tab.label,
            tabBarBadge:
              tab.name === tabNavigations.ALARM && hasNewAlarm
                ? ' '
                : undefined,
            tabBarIcon: ({focused}: {focused: boolean}) =>
              nativeTabIcon(focused ? tab.activePng : tab.idlePng),
          }}
          listeners={({
            navigation,
          }: {
            navigation: {
              getState: () => {index: number; routes: {name: string}[]};
            };
          }) => ({
            tabPress: () => {
              const state = navigation.getState();
              const currentRoute = state.routes[state.index];
              onTabPress(tab.name, currentRoute?.name === tab.name);
            },
          })}
        />
      ))}
    </NativeTab.Navigator>
  );
}

function JsTabNavigator() {
  const hasNewAlarm = useHasNewAlarm();
  const insets = useSafeAreaInsets();
  const {onTabPress} = useTabActions();

  return (
    <JsTab.Navigator
      id={MAIN_TABS_ID}
      tabBar={props => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#101828',
        tabBarInactiveTintColor: '#667085',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          height: 56 + (insets.bottom > 0 ? insets.bottom : 8),
        },
        lazy: true,
      }}>
      {TAB_CONFIG.map(tab => (
        <JsTab.Screen
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
            tabPress: () => {
              const state = navigation.getState();
              const currentRoute = state.routes[state.index];
              onTabPress(tab.name, currentRoute?.name === tab.name);
            },
          })}
        />
      ))}
    </JsTab.Navigator>
  );
}

function MainTabNavigator() {
  if (isIos26SystemTabBar()) {
    return <NativeSystemTabNavigator />;
  }
  return <JsTabNavigator />;
}

export default MainTabNavigator;

const styles = StyleSheet.create({
  barWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
