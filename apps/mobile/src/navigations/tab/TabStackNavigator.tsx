import React, {useCallback, useEffect, useRef} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';

import TabWebView from '@/screens/tabs/TabWebView';
import HomeScreen from '@/screens/home/HomeScreen';
import JirumAlarmWebViewScreen from '@/screens/jirumalarmwebview/JirumAlarmWebViewScreen';
import CurationScreen from '@/screens/curation/CurationScreen';
import {NATIVE_HOME} from '@/constants/feature-flags';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import SearchStackNavigator from './SearchStackNavigator';
import ProductCommentsScreen from '@/screens/comment/ProductCommentsScreen';
import {
  tabStackNavigations,
  tabNavigations,
} from '@/shared/constant/navigations';
import {getTabBaseUrl} from '@/shared/lib/navigation/tab-routing';
import {useTabBarVisibility} from '@/shared/hooks/useTabBarVisibility';
import {useHideTabBar} from '@/shared/hooks/useHideTabBar';
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
  // ★탭바를 숨긴다. web 페이지가 자체 하단 UI(구매 CTA·찜하기)를 갖고 있어
  // 탭바가 그 위에 겹친다 — useHideTabBar 주석의 "상세 하위 웹뷰" 사례.
  // 상세·댓글·검색은 이미 이 훅을 쓰는데 이 화면만 빠져 있었다.
  useHideTabBar();

  const Screen = JirumAlarmWebViewScreen as unknown as React.ComponentType<{
    route: {params: {uri: string}};
  }>;
  return <Screen route={{params: {uri: route.params.uri}}} />;
}

export function createTabStack(tabName: TabName) {
  return function TabStack() {
    const onFocusedRoute = useSyncNativeTabBarHidden();

    return (
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        screenListeners={{
          state: e => {
            const stack = e.data.state;
            onFocusedRoute(stack.routes[stack.index]?.name);
          },
        }}>
        <Stack.Screen name={tabStackNavigations.ROOT}>
          {() =>
            // 홈만 네이티브. 나머지 4개 탭은 웹뷰 그대로라 영향이 없다.
            // OTA 가 없어 원격 킬스위치가 아니라 빌드 스위치다
            // (mobile-no-ota-store-review-required).
            NATIVE_HOME && tabName === tabNavigations.HOME ? (
              <HomeScreen />
            ) : (
              <TabWebView tabName={tabName} baseUrl={getTabBaseUrl(tabName)} />
            )
          }
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
