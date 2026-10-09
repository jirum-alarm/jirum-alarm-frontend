import {removeAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {showToast} from '@/shared/lib/feedback';
import {StorageKey} from '@/shared/constant/storage-key';
import {bindFcmTokenToUser} from '@/shared/lib/fcm/push-permission';
import {setGuest} from '@/shared/lib/auth/guest';

export const handleLoginSuccess = async (
  accessToken?: string,
  refreshToken?: string | null,
  {guest = false}: {guest?: boolean} = {},
) => {
  if (!accessToken || !refreshToken) {
    console.error('Login success handler: Invalid token data structure');
    await handleLoginError('로그인 응답이 올바르지 않아요.');
    return;
  }

  try {
    await setAsyncStorage(StorageKey.ACCESS_TOKEN, accessToken);
    await setAsyncStorage(StorageKey.REFRESH_TOKEN, refreshToken);
    // 실제 로그인이면 게스트는 끝난다(키워드는 백엔드가 기기 기준으로 이 계정에 합친다).
    await setGuest(guest);
    // 기다리지 않는다 — 네트워크 한 번 때문에 로그인 전환이 늦어질 이유가 없다.
    bindFcmTokenToUser();
    if (!guest)
      showToast.success('로그인 성공! 알림 설정하고 핫딜을 받아보세요!');
  } catch (storageError) {
    console.error('Error saving tokens:', storageError);
    showToast.error('로그인 처리 중 오류가 생겼어요.');
    await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
    await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
  }
};

/** `errorMessage: null` = 화면이 직접 안내하므로 토스트를 띄우지 않는다. */
export const handleLoginError = async (
  errorMessage: string | null = '로그인에 실패했어요.',
) => {
  try {
    await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
    await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
  } catch (storageError) {
    console.error('Error removing tokens:', storageError);
  } finally {
    if (errorMessage) showToast.error(errorMessage);
  }
};
