import React from 'react';
import MainTabNavigator from '@/navigations/tab/MainTabNavigator';
import {mainNavigations} from '@/shared/constant/navigations';

/** @deprecated 기존 단일 WebView 화면에서 사용하던 타입. 호환성 유지용. */
export type MainParamList = {
  [mainNavigations.JIRUM_ALARM_WEBVIEW]: {uri?: string};
};

function MainStackNavigator() {
  return <MainTabNavigator />;
}

export default MainStackNavigator;
