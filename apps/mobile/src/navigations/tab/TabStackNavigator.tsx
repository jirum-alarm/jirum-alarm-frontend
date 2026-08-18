import React, {useCallback, useEffect, useRef} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import TabWebView from '@/screens/tabs/TabWebView';
import HomeScreen from '@/screens/home/HomeScreen';
import TrendingScreen from '@/screens/trending/TrendingScreen';
import JirumAlarmWebViewScreen from '@/screens/jirumalarmwebview/JirumAlarmWebViewScreen';
import CurationScreen from '@/screens/curation/CurationScreen';
import TossCurationScreen from '@/screens/curation/TossCurationScreen';
import {NATIVE_DISCOVER, NATIVE_HOME} from '@/constants/feature-flags';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import SearchStackNavigator from './SearchStackNavigator';
import ProductCommentsScreen from '@/screens/comment/ProductCommentsScreen';
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
import {
  commentsHeaderOptions,
  productDetailHeaderOptions,
} from './native-headers';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

const Stack = createNativeStackNavigator<TabStackParamList>();

/**
 * 이 탭의 탭바 표시를 숨김 카운터와 맞춘다.
 * JS 탭바는 AnimatedTabBar 가 translateY 로도 숨기지만,
 * tabBarStyle.display 를 같이 맞춰 두면 레이아웃 여백이 안 남는다.
 *
 * iOS 26 clip 은 네이티브로 push 한 화면만 켠다. 웹뷰 안 SPA 는
 * 자르면 댓글 입력창 아래가 빈다.
 */
function useSyncNativeTabBarHidden() {
  const visible = useTabBarVisibility();
  const navigation = useNavigation();
  const clipWhenHiddenRef = useRef(false);

  const apply = useCallback(
    (clipWhenHidden: boolean) => {
      clipWhenHiddenRef.current = clipWhenHidden;
      navigation.setOptions({
        tabBarStyle: {display: visible ? 'flex' : 'none'},
        tabBarClipWhenHidden: !visible && clipWhenHidden,
      });
    },
    [visible, navigation],
  );

  useEffect(() => {
    apply(clipWhenHiddenRef.current);
  }, [apply]);

  return useCallback(
    (routeName: string | undefined) => {
      apply(routeName !== tabStackNavigations.ROOT);
    },
    [apply],
  );
}

/**
 * 이 라우트에서 탭바를 숨기나.
 *
 * ★화면마다 useHideTabBar 를 거는 대신 **라우트 이름 하나로** 판단한다.
 * 화면별 훅은 focus/cleanup 순서에 의존해서 카운터가 새기 쉬웠다 —
 * 탭 5개가 각자 같은 스택을 갖고 있어 특히 그렇다(탭바가 사라져 안 돌아오던
 * 증상의 뿌리). 라우트는 언제나 정확히 하나이므로 어긋날 수가 없다.
 */
function hidesTabBar(routeName: string | undefined): boolean {
  return (
    // ★상세는 숨기지 않는다(2026-08-17 사용자 지시). 찜/구매 CTA 가 탭바
    // 위에 얹히므로 BottomCTA 가 탭바 높이만큼 더 띄운다.
    // web 은 상세에서 BottomNav 를 아예 렌더하지 않지만 앱은 다르게 간다.
    routeName === tabStackNavigations.COMMENTS ||
    routeName === tabStackNavigations.SEARCH ||
    routeName === tabStackNavigations.CURATION ||
    routeName === tabStackNavigations.TOSS_CURATION ||
    routeName === tabStackNavigations.WEBVIEW
  );
}

/**
 * 탭 하나를 감싸는 네이티브 스택.
 *
 * 루트는 기존 탭 WebView 그대로. 상세는 그 위에 push 되어 네이티브 슬라이드
 * 전환을 탄다 — 전환 중 이전 화면이 뒤에 남으므로 흰 화면이 안 생긴다.
 * iOS 스와이프 뒤로가기도 스택이 알아서 붙여준다.
 */
/**
 * 큐레이션 등 웹 페이지를 탭 스택에 쌓는 화면.
 * JirumAlarmWebViewScreen 은 MainParamList 로 타이핑돼 있어 그대로 못 넣는다 —
 * params 모양({uri})이 같으므로 얇게 감싼다.
 */
function TabWebViewPage({
  route,
}: {
  route: {params: {uri: string; title?: string}};
}) {
  const Screen = JirumAlarmWebViewScreen as unknown as React.ComponentType<{
    route: {params: {uri: string}};
  }>;
  return <Screen route={{params: {uri: route.params.uri}}} />;
}

export function createTabStack(tabName: TabName) {
  return function TabStack() {
    const onFocusedRoute = useSyncNativeTabBarHidden();
    // 이 탭이 지금 화면에 보이는 탭인가. 리스너 안에서 최신값을 읽어야 하므로
    // ref 로 들고 있는다(리스너는 재생성되지 않는다).
    const isTabFocused = useIsFocused();
    const isFocusedRef = useRef(isTabFocused);
    isFocusedRef.current = isTabFocused;

    // 이 탭으로 돌아왔을 때 자기 스택 최상단 기준으로 다시 맞춘다.
    // (다른 탭에 있는 동안 이 탭의 리스너는 위 가드로 막혀 있었다)
    const navigation = useNavigation();
    useEffect(() => {
      if (!isTabFocused) return;
      const state = navigation.getState();
      const focused = state?.routes?.[state.index]?.name;
      setTabBarVisible(!hidesTabBar(focused));
    }, [isTabFocused, navigation]);

    return (
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        screenListeners={{
          state: e => {
            const stack = e.data.state;
            const focused = stack.routes[stack.index]?.name;
            onFocusedRoute(focused);
            // ★탭바 표시는 여기서 한 곳으로 정한다(화면별 훅 대신).
            //
            // ★★단 **이 탭이 지금 보고 있는 탭일 때만**. 이 리스너는 탭 5개의
            // 스택에서 각각 돌기 때문에, 발견 탭에 상세를 열어둔 채 홈으로 오면
            // 발견 탭 리스너가 false 로 덮어써 홈에서도 탭바가 사라진다.
            if (isFocusedRef.current) {
              setTabBarVisible(!hidesTabBar(focused));
            }
          },
        }}>
        <Stack.Screen name={tabStackNavigations.ROOT}>
          {() => {
            // 홈·발견만 네이티브. 남은 3개 탭은 웹뷰 그대로라 영향이 없다.
            // OTA 가 배선돼 있어 플래그를 `eas update` 로 되돌릴 수 있다
            // (feature-flags.ts 주석 참조).
            if (NATIVE_HOME && tabName === tabNavigations.HOME) {
              return <HomeScreen />;
            }
            if (NATIVE_DISCOVER && tabName === tabNavigations.DISCOVER) {
              return <TrendingScreen />;
            }
            return (
              <TabWebView tabName={tabName} baseUrl={getTabBaseUrl(tabName)} />
            );
          }}
        </Stack.Screen>
        <Stack.Screen
          name={tabStackNavigations.DETAIL}
          component={ProductDetailScreen}
          options={productDetailHeaderOptions}
        />
        <Stack.Screen
          name={tabStackNavigations.SEARCH}
          component={SearchStackNavigator}
        />
        <Stack.Screen
          name={tabStackNavigations.CURATION}
          component={CurationScreen}
          options={({route}) => ({
            headerShown: true,
            headerShadowVisible: false,
            headerTintColor: '#101828',
            headerBackButtonDisplayMode: 'minimal',
            headerStyle: {backgroundColor: '#ffffff'},
            title: route.params?.title ?? '',
          })}
        />
        <Stack.Screen
          name={tabStackNavigations.TOSS_CURATION}
          component={TossCurationScreen}
          options={{
            headerShown: true,
            headerShadowVisible: false,
            headerTintColor: '#101828',
            headerBackButtonDisplayMode: 'minimal',
            headerStyle: {backgroundColor: '#ffffff'},
            title: '',
          }}
        />
        <Stack.Screen
          name={tabStackNavigations.WEBVIEW}
          component={TabWebViewPage}
          // ★네이티브 헤더를 띄우지 않는다. 여기서 여는 web 페이지
          // (/toss·/curation)는 **자체 헤더**(제목·뒤로가기·검색·공유)를
          // 갖고 있어 헤더가 두 개로 겹친다. 뒤로가기는 웹 헤더와
          // iOS 스와이프가 담당한다.
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={tabStackNavigations.COMMENTS}
          component={ProductCommentsScreen}
          options={commentsHeaderOptions}
        />
      </Stack.Navigator>
    );
  };
}
