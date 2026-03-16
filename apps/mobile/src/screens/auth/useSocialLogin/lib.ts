import {removeAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {showToast} from '@/shared/lib/feedback';
import {StorageKey} from '@/shared/constant/storage-key';

export const handleLoginSuccess = async (
  accessToken?: string,
  refreshToken?: string | null,
) => {
  if (!accessToken || !refreshToken) {
    console.error('Login success handler: Invalid token data structure');
    await handleLoginError('로그인 응답 데이터가 올바르지 않습니다.');
    return;
  }

  try {
    await setAsyncStorage(StorageKey.ACCESS_TOKEN, accessToken);
    await setAsyncStorage(StorageKey.REFRESH_TOKEN, refreshToken);
    showToast.info('로그인 성공! 알림 설정하고 핫딜을 받아보세요!');
  } catch (storageError) {
    console.error('Error saving tokens:', storageError);
    showToast.error('로그인 처리 중 오류가 발생했습니다.');
    await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
    await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
  }
};

export const handleLoginError = async (
  errorMessage = '로그인에 실패했습니다.',
) => {
  try {
    await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
    await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
  } catch (storageError) {
    console.error('Error removing tokens:', storageError);
  } finally {
    showToast.error(errorMessage);
  }
};
