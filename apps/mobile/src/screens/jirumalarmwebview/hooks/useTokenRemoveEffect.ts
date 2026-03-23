import {useEffect} from 'react';
import {removeAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';
import {AuthBridge} from '@/shared/lib/webview';
import {useQueryClient} from '@tanstack/react-query';
import {AuthQueries} from '@/entities/auth';

export const useTokenRemoveEffect = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const handler = async () => {
      await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
      await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
      await queryClient.invalidateQueries({
        queryKey: AuthQueries.keys.loginByRefreshToken(),
      });
      // 여기서 필요한 hook 로직 추가 (예: 상태 변경, 라우팅 등)
    };
    AuthBridge.addTokenRemoveListener(handler);
    return () => {
      AuthBridge.removeTokenRemoveListener(handler);
    };
  }, [queryClient]);
};
