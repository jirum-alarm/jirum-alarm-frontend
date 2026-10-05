import React, {useCallback, useEffect, useRef} from 'react';
import AuthNavigator from '../stack/AuthNavigator.tsx';
import MainNavigator from '../stack/MainNavigator.tsx';
import {useAuth} from '@/shared/hooks/useAuth';
import RNBootSplash from 'react-native-bootsplash';
import useAppStateTokenRefresh from '@/shared/hooks/useAppStateTokenRefresh';
import useForceUpdate from '@/shared/hooks/useForceUpdate';
import ForceUpdateScreen from '@/screens/update/ForceUpdateScreen';
import {useQuery} from '@tanstack/react-query';
import {UserQueries} from '@/entities/user/user.queries';
import {Analytics} from '@/shared/lib/analytics/ga4';

const RootNavigator = () => {
  const {isLogin, isLoading} = useAuth();
  const {needsUpdate} = useForceUpdate();
  useAppStateTokenRefresh();

  // 자동 로그인으로 들어온 사람도 GA4 user_id 를 단다 — 예전엔 로그인 화면을 지날 때만 달아서
  // 이미 로그인돼 있던 대부분의 앱 사용자가 익명으로 남았다. (access 요청은 첫 토큰 갱신까지 줄 선다)
  const {data: myUserId} = useQuery({...UserQueries.me(), enabled: isLogin});
  useEffect(() => {
    if (myUserId) Analytics.identify(myUserId);
  }, [myUserId]);
  const splashHidden = useRef(false);

  const hideSplash = useCallback(() => {
    if (!splashHidden.current) {
      splashHidden.current = true;
      RNBootSplash.hide({fade: true});
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      hideSplash();
    }
  }, [isLoading, hideSplash]);

  if (isLoading) {
    return null;
  }

  // 버전 게이트는 로그인 여부보다 앞선다 — 구버전은 로그인 흐름 자체가
  // 깨져 있을 수 있다. 정책을 못 읽으면 needsUpdate 가 false 라 그냥 통과한다.
  if (needsUpdate) {
    return <ForceUpdateScreen />;
  }

  return isLogin ? <MainNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
