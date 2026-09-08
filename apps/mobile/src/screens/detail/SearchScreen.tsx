import React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import type {SearchStackParamList} from '@/navigations/tab/types';
import {searchStackNavigations} from '@/shared/constant/navigations';

import NativeSearchScreen from '@/screens/search/SearchScreen';

type Props = NativeStackScreenProps<
  SearchStackParamList,
  typeof searchStackNavigations.HOME
>;

/**
 * 검색 플로우의 루트.
 *
 * ★2026-09-08: 본문이 웹뷰(`StackWebView path="/search"`)에서 네이티브가 됐다.
 * 화면은 `screens/search/` 로 옮겼고 여기는 라우트 등록을 안 건드리기 위한
 * 얇은 껍데기만 남긴다(`SearchStackNavigator` 가 이 경로를 import 한다).
 */
export default function SearchScreen({navigation, route}: Props) {
  return <NativeSearchScreen navigation={navigation} route={route} />;
}
