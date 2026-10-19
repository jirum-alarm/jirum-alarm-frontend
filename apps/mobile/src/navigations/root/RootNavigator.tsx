import React, {useCallback, useEffect, useRef} from 'react';
import AuthNavigator from '../stack/AuthNavigator.tsx';
import MainNavigator from '../stack/MainNavigator.tsx';
import {useAuth} from '@/entities/auth/useAuth';
import RNBootSplash from 'react-native-bootsplash';
import useAppStateTokenRefresh from '@/entities/auth/useAppStateTokenRefresh';
import useForceUpdate from '@/shared/hooks/useForceUpdate';
import ForceUpdateScreen from '@/screens/update/ForceUpdateScreen';
import {useQuery} from '@tanstack/react-query';
import {UserQueries} from '@/entities/user/user.queries';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {setSentryUser} from '@/shared/lib/monitoring/sentry';
import {useAutoGuest} from '@/screens/auth/useAutoGuest';
import {useAdoptWebGuest} from '@/screens/auth/useAdoptWebGuest';

const RootNavigator = () => {
  const {isLogin, isMember, isLoading} = useAuth();
  const {needsUpdate} = useForceUpdate();
  useAppStateTokenRefresh();
  // 첫 실행은 로그인 화면 대신 게스트로 — 판단·발급 동안 스플래시를 유지한다.
  const {pending: autoGuestPending} = useAutoGuest({isLoading, isLogin});
  // 웹에서 「앱 열기」로 넘어온 게스트를 이어받는다 — 자동 게스트까지 끝난 뒤에.
  useAdoptWebGuest({
    ready: !isLoading && !autoGuestPending,
    isLogin,
    isMember,
  });

  // 자동 로그인으로 들어온 사람도 GA4 user_id 를 단다 — 예전엔 로그인 화면을 지날 때만 달아서
  // 이미 로그인돼 있던 대부분의 앱 사용자가 익명으로 남았다. (access 요청은 첫 토큰 갱신까지 줄 선다)
  const {data: myUserId} = useQuery({...UserQueries.me(), enabled: isLogin});
  useEffect(() => {
    if (myUserId) Analytics.identify(myUserId);
  }, [myUserId]);
  // Sentry 에도 같은 id — 로그아웃·세션 거절(isLogin false)이면 바로 뗀다. 게스트는 me 가 null.
  useEffect(() => {
    setSentryUser(isLogin && myUserId ? myUserId : null);
  }, [isLogin, myUserId]);
  const splashHidden = useRef(false);

  const hideSplash = useCallback(() => {
    if (!splashHidden.current) {
      splashHidden.current = true;
      RNBootSplash.hide({fade: true});
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !autoGuestPending) {
      hideSplash();
    }
  }, [isLoading, autoGuestPending, hideSplash]);

  if (isLoading || autoGuestPending) {
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
