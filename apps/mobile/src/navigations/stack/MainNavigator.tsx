import React from 'react';
import MainTabNavigator from '@/navigations/tab/MainTabNavigator';
import {PendingLoginRestore} from '@/shared/hooks/PendingLoginRestore';
import useAlarmDotSync from '@/shared/hooks/useAlarmDotSync';
import {mainNavigations} from '@/shared/constant/navigations';

/** @deprecated 기존 단일 WebView 화면에서 사용하던 타입. 호환성 유지용. */
export type MainParamList = {
  [mainNavigations.JIRUM_ALARM_WEBVIEW]: {uri?: string};
};

function MainStackNavigator() {
  // 탭바 알림 점의 원료(미읽음 수)를 앱 진입·포그라운드 복귀마다 받아온다.
  // 탭 화면 밖(여기)에 두는 이유: 알림 탭을 한 번도 안 열어도 점은 떠야 한다.
  useAlarmDotSync();

  return (
    <>
      <PendingLoginRestore />
      <MainTabNavigator />
    </>
  );
}

export default MainStackNavigator;
