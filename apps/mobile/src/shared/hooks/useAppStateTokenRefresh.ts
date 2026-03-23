import {useEffect, useRef} from 'react';
import {AppState, type AppStateStatus} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {AuthQueries} from '@/entities/auth';

const useAppStateTokenRefresh = () => {
  const queryClient = useQueryClient();
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        queryClient.invalidateQueries({
          queryKey: AuthQueries.keys.loginByRefreshToken(),
        });
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [queryClient]);
};

export default useAppStateTokenRefresh;
