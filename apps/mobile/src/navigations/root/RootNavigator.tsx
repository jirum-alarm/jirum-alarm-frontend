import React, {useCallback, useEffect, useRef} from 'react';
import AuthNavigator from '../stack/AuthNavigator.tsx';
import MainNavigator from '../stack/MainNavigator.tsx';
import {useAuth} from '@/shared/hooks/useAuth';
import RNBootSplash from 'react-native-bootsplash';
import useAppStateTokenRefresh from '@/shared/hooks/useAppStateTokenRefresh';

const RootNavigator = () => {
  const {isLogin, isLoading} = useAuth();
  useAppStateTokenRefresh();
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

  return isLogin ? <MainNavigator /> : <AuthNavigator />;
};

export default RootNavigator;
