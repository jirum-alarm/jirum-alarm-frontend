import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import {AuthQueries} from '@/entities/auth';

/**
 * 백그라운드에 다녀오면 토큰을 갱신한다(서버는 앱 상태 'active' 갱신을 방문으로 센다).
 *
 * ★'inactive' 만 거쳐 온 복귀는 세지 않는다 — iOS 는 알림 센터·제어 센터·Face ID·권한 창·공유 시트마다
 * active→inactive→active 를 오가서, 예전엔 화면을 떠난 적도 없는데 그때마다 갱신 요청이 나갔다.
 * background 를 한 번이라도 거쳤는지로 가른다(iOS 복귀는 background→inactive→active 일 수도 있다).
 */
const useAppStateTokenRefresh = () => {
  const queryClient = useQueryClient();
  const wentBackground = useRef(AppState.currentState === 'background');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        wentBackground.current = true;
        return;
      }
      if (nextAppState === 'active' && wentBackground.current) {
        wentBackground.current = false;
        queryClient.invalidateQueries({
          queryKey: AuthQueries.keys.loginByRefreshToken(),
        });
      }
    });

    return () => subscription.remove();
  }, [queryClient]);
};

export default useAppStateTokenRefresh;
