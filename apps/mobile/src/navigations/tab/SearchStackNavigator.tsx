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

const Stack = createNativeStackNavigator<SearchStackParamList>();

/**
 * 검색 전용 스택.
 *
 * 탭 스택(홈에서 연 상세)과 검색에서 연 상세를 섞지 않는다.
 * 검색 웹뷰는 이 스택의 루트라서, 결과 → 상품 → 뒤로가면 결과가 그대로 남는다.
 */
export default function SearchStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
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
