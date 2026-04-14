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
import {useTabBarVisibility} from '@/shared/hooks/useTabBarVisibility';

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
  const tabBarHeight = 56 + (insets.bottom > 0 ? insets.bottom : 8);
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: tabBarVisible ? 0 : tabBarHeight,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [tabBarVisible, tabBarHeight, translateY]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        transform: [{translateY}],
      }}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

function MainTabNavigator() {
  const {setActiveTab, getWebViewRef} = useWebviewContext();
  const hasNewAlarm = useHasNewAlarm();
  const insets = useSafeAreaInsets();

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
        tabBarStyle: {
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
