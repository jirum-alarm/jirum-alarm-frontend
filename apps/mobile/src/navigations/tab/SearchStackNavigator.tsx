import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SearchScreen from '@/screens/detail/SearchScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import ProductCommentsScreen from '@/screens/comment/ProductCommentsScreen';
import {
  searchStackNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import type {SearchStackParamList} from './types';
import {
  commentsHeaderOptions,
  productDetailHeaderOptions,
} from './native-headers';
import AppStackHeader from './AppStackHeader';

const Stack = createNativeStackNavigator<SearchStackParamList>();

/**
 * 검색 전용 스택.
 *
 * 탭 스택(홈에서 연 상세)과 검색에서 연 상세를 섞지 않는다.
 * 검색 웹뷰는 이 스택의 루트라서, 결과 → 상품 → 뒤로가면 결과가 그대로 남는다.
 */

// 모듈 스코프 — 렌더마다 새 함수를 만들면 헤더가 매번 다시 마운트된다.
const renderAppStackHeader = (
  props: React.ComponentProps<typeof AppStackHeader>,
) => <AppStackHeader {...props} />;

export default function SearchStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, header: renderAppStackHeader}}>
      <Stack.Screen
        name={searchStackNavigations.HOME}
        component={SearchScreen}
      />
      <Stack.Screen
        name={tabStackNavigations.DETAIL}
        component={ProductDetailScreen}
        options={productDetailHeaderOptions}
      />
      <Stack.Screen
        name={tabStackNavigations.COMMENTS}
        component={ProductCommentsScreen}
        options={commentsHeaderOptions}
      />
    </Stack.Navigator>
  );
}
