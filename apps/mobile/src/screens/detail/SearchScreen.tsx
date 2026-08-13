import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {SearchStackParamList} from '@/navigations/tab/types';
import {searchStackNavigations} from '@/shared/constant/navigations';

import {StackWebView} from './ProductDetailWebViewScreen';

type Props = NativeStackScreenProps<
  SearchStackParamList,
  typeof searchStackNavigations.HOME
>;

/**
 * 검색 플로우의 루트. 헤더는 웹 검색 페이지(뒤로가기 + 입력창)를 그대로 쓴다.
 * 네이티브 헤더를 또 올리면 뒤로가기가 두 개가 된다.
 */
export default function SearchScreen({navigation}: Props) {
  return (
    <StackWebView
      path="/search"
      navigation={navigation}
      hideTabBar
      hideWebNav
    />
  );
}
