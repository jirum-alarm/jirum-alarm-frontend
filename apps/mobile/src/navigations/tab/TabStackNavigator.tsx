import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import TabWebView from '@/screens/tabs/TabWebView';
import HomeScreen from '@/screens/home/HomeScreen';
import TrendingScreen from '@/screens/trending/TrendingScreen';
import AlarmScreen from '@/screens/alarm/AlarmScreen';
import MyPageScreen from '@/screens/mypage/MyPageScreen';
import CommunityScreen from '@/screens/community/CommunityScreen';
import {
  tabStackNavigations,
  tabNavigations,
} from '@/shared/constant/navigations';
import {getTabBaseUrl} from '@/shared/lib/navigation/tab-routing';
import {
  setTabBarVisible,
  useTabBarVisibility,
} from '@/shared/hooks/useTabBarVisibility';
import type {TabStackParamList} from './types';
import {SCREEN_BACKGROUND_COLOR} from './native-headers';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

const Stack = createNativeStackNavigator<TabStackParamList>();

/**
 * 탭바 표시(스토어)를 이 탭의 옵션에 맞춘다. JS 탭바는 스토어를 직접 구독하지만,
 * iOS 26 네이티브 탭바는 `tabBarStyle.display` 로만 숨는다.
 *
 * ★라우트 때문에 숨기는 일은 이제 없다 — 상세·검색·내정보 하위 등은 탭 **바깥** 루트 스택
 * (MainNavigator)에 push 되어 탭바째 덮는다. 예전엔 탭 안 스택에 쌓고 탭바를 숨겼다가
 * 되살려서, 뒤로 갈 때마다 "뒤늦게 생긴다·깜빡인다"(2026-10-01 사용자)가 났다.
 * 남은 숨김은 탭 루트 위에서 탭바를 가리는 경우뿐이다(고객센터 상담창, 웹뷰 탭의 하위 URL).
 */
function useSyncNativeTabBarHidden() {
  const visible = useTabBarVisibility();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: {display: visible ? 'flex' : 'none'},
      // 탭 루트는 웹뷰일 수 있어 자르지 않는다(자르면 웹 입력창 아래가 빈다).
      tabBarClipWhenHidden: false,
    });
  }, [visible, navigation]);
}

/**
 * 탭 루트 화면. 홈·발견·알림·커뮤니티·내정보 다섯 탭 모두 네이티브가 정본이다
 * (2026-09-07 feature-flags 삭제 — 되돌릴 땐 플래그가 아니라 해당 커밋을 eas update).
 * ★2026-09-08 로 다섯 탭 전부 네이티브라 TabWebView 폴백은 도달하지 않는다. 그 웹뷰 ref·
 * 주입 경로(WebViewRefProvider·getWebViewRef)는 별도 정리 대상이라 폴백으로 남긴다.
 */
const NATIVE_TAB_ROOTS: Partial<Record<TabName, React.ComponentType>> = {
  [tabNavigations.HOME]: HomeScreen,
  [tabNavigations.DISCOVER]: TrendingScreen,
  [tabNavigations.ALARM]: AlarmScreen,
  [tabNavigations.COMMUNITY]: CommunityScreen,
  [tabNavigations.MYPAGE]: MyPageScreen,
};
const webViewTabRoots = new Map<TabName, React.ComponentType>();

/** 탭마다 **같은 컴포넌트 참조**를 돌려준다 — 렌더마다 바뀌면 루트가 매번 다시 그려진다. */
function getTabRootScreen(tabName: TabName): React.ComponentType {
  const native = NATIVE_TAB_ROOTS[tabName];
  if (native) return native;
  let root = webViewTabRoots.get(tabName);
  if (!root) {
    root = function TabWebViewRoot() {
      return <TabWebView tabName={tabName} baseUrl={getTabBaseUrl(tabName)} />;
    };
    webViewTabRoots.set(tabName, root);
  }
  return root;
}

/**
 * 탭 하나 = 그 탭의 루트 화면 하나. 스택으로 감싸는 건 탭 루트가 헤더 옵션·
 * `navigation.push` 를 그대로 쓰게 하려는 것뿐이다(push 는 루트 스택으로 올라간다).
 */
export function createTabStack(tabName: TabName) {
  return function TabStack() {
    useSyncNativeTabBarHidden();

    // 탭을 옮기면 탭바를 되살린다 — 웹뷰 탭이 하위 URL 에서 꺼둔 채 떠난 경우.
    const isTabFocused = useIsFocused();
    useEffect(() => {
      if (isTabFocused) setTabBarVisible(true);
    }, [isTabFocused]);

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: {backgroundColor: SCREEN_BACKGROUND_COLOR},
        }}>
        {/* ★component 로 넘긴다 — 렌더 콜백({() => ...})은 렌더마다 새 함수라
            react-navigation 이 루트를 건너뛰지 못해 탭 루트 전체가 다시 그려진다. */}
        <Stack.Screen
          name={tabStackNavigations.ROOT}
          component={getTabRootScreen(tabName)}
        />
      </Stack.Navigator>
    );
  };
}
