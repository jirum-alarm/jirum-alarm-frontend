import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import TabWebView from '@/screens/tabs/TabWebView';
import ProductDetailWebViewScreen from '@/screens/detail/ProductDetailWebViewScreen';
import {
  tabStackNavigations,
  tabNavigations,
} from '@/shared/constant/navigations';
import {getTabBaseUrl} from '@/shared/lib/navigation/tab-routing';
import type {TabStackParamList} from './types';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

const Stack = createNativeStackNavigator<TabStackParamList>();

/**
 * 탭 하나를 감싸는 네이티브 스택.
 *
 * 루트는 기존 탭 WebView 그대로. 상세는 그 위에 push 되어 네이티브 슬라이드
 * 전환을 탄다 — 전환 중 이전 화면이 뒤에 남으므로 흰 화면이 안 생긴다.
 * iOS 스와이프 뒤로가기도 스택이 알아서 붙여준다.
 */
export function createTabStack(tabName: TabName) {
  return function TabStack() {
    return (
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name={tabStackNavigations.ROOT}>
          {() => (
            <TabWebView tabName={tabName} baseUrl={getTabBaseUrl(tabName)} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name={tabStackNavigations.DETAIL}
          component={ProductDetailWebViewScreen}
        />
      </Stack.Navigator>
    );
  };
}
