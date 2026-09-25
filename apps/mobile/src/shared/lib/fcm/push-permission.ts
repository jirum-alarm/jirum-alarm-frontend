import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

import {NotificationService} from '@/shared/api/notification';
import {TokenType} from '@/shared/api/gql/graphql.ts';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import {waitForDeviceId} from '@/shared/lib/device/device-id';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';

/**
 * FCM 토큰을 받아 서버에 등록한다. 앱 진입(useFCMTokenManager)과
 * 키워드 등록 직후 권한을 새로 받았을 때 공용.
 */
export async function registerFcmToken(): Promise<void> {
  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
  await setAsyncStorage(StorageKey.FCM_DEVICE_TOKEN, token);
  // X-Device-Id 없이 등록하면 서버가 deviceId=NULL 로 저장하고, 그 토큰은 기기 단위
  // 옛 토큰 회수에서 영구 제외돼 알림이 중복된다. 헤더가 붙을 때까지만 잠깐 기다린다.
  // (타임아웃되면 그대로 등록한다 — 중복 푸시보다 미등록이 더 큰 사고다.)
  await waitForDeviceId();
  await NotificationService.addToken({token, tokenType: TokenType.Fcm});
}

/**
 * 앱 진입 때 등록해 둔 FCM 토큰을 **방금 로그인한 계정**에 다시 묶는다.
 *
 * 앱 진입 등록(useFCMTokenManager)은 로그인 게이트 밖에서 한 번만 돈다 — 로그아웃
 * 상태로 켰다면 토큰은 익명으로 올라가 있다. 웹뷰 로그인 시절엔 AuthBridge.login 이
 * 이 재등록을 했는데 네이티브 로그인 화면은 안 해서, 새로 깔고 로그인한 유저는
 * 앱을 껐다 켜기 전까지 키워드 알림을 못 받았다.
 *
 * 저장된 토큰이 없으면(= 진입 때 등록을 안 했으면) 아무것도 안 한다 — 권한은
 * 진입·키워드 등록 경로가 맡는다. 실패는 삼킨다(로그인은 이미 성공했다).
 */
export async function bindFcmTokenToUser(): Promise<void> {
  try {
    const token: string | null = await getAsyncStorage(
      StorageKey.FCM_DEVICE_TOKEN,
    );
    if (!token) return;
    await waitForDeviceId();
    await NotificationService.addToken({token, tokenType: TokenType.Fcm});
  } catch (error) {
    console.log('bind fcm token error:', error);
  }
}

/**
 * 키워드(알림 대상)를 등록한 직후 — 알림 권한이 **아직 없고 물어볼 수 있으면** 묻는다.
 * web `useFcmPermission().requestPermission()` 과 같은 자리.
 *
 * - 이미 허용 → 아무것도 안 한다.
 * - 물어볼 수 없음(iOS 거부 확정·Android 영구 거부) → 아무것도 안 한다(OS 가 무시한다).
 * - 새로 허용됨 → 토큰을 등록한다. iOS 는 앱 진입 때 허용이 아니면 토큰 등록을
 *   건너뛰므로, 여기서 안 하면 허용해도 푸시가 안 온다.
 *
 * ★권한 조회는 expo-notifications 로 한다 — RNFirebase `requestPermission` 은
 * Android 에서 **요청 없이 1(AUTHORIZED)을 돌려주는 no-op** 이라(`@platform ios`)
 * Android 13+ 의 POST_NOTIFICATIONS 를 묻지 못한다. `canAskAgain` 이 "요청 가능한
 * 상태"를 두 플랫폼 공통으로 알려준다.
 *
 * 실패는 삼킨다 — 키워드 등록은 이미 성공했고, 권한 요청 실패로 흐름을 막지 않는다.
 */
export async function requestPushPermissionIfNeeded(): Promise<void> {
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || !current.canAskAgain) return;
    const next = await Notifications.requestPermissionsAsync();
    if (next.granted) await registerFcmToken();
  } catch (error) {
    console.log('push permission error:', error);
  }
}
