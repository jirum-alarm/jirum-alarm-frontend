import {useCallback, useEffect, useState} from 'react';
import {AppState, Linking} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import {registerFcmToken} from './push-permission';

/**
 * 알림 권한이 켜져 있나 — 화면이 보일 때·앱으로 돌아올 때 다시 본다(설정에서 켜고 돌아온 경우).
 * `null` = 아직 모름(배너를 깜빡 띄우지 않는다).
 *
 * `enable`: 물어볼 수 있으면 OS 팝업, 더는 못 물으면 설정 앱으로.
 */
export function usePushPermissionStatus() {
  const [granted, setGranted] = useState<boolean | null>(null);

  const check = useCallback(() => {
    Notifications.getPermissionsAsync()
      .then(p => setGranted(p.granted))
      .catch(() => setGranted(null));
  }, []);

  useFocusEffect(check);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') check();
    });
    return () => sub.remove();
  }, [check]);

  const enable = useCallback(async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (!current.canAskAgain) {
        Linking.openSettings();
        return;
      }
      const next = await Notifications.requestPermissionsAsync();
      setGranted(next.granted);
      if (next.granted) await registerFcmToken();
    } catch (error) {
      console.log('push enable error:', error);
    }
  }, []);

  return {granted, enable};
}
