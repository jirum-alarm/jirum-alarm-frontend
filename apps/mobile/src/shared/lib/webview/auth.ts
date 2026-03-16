import {
  type WebViewEventPayloads,
  WebViewEventType,
} from '@/shared/lib/webview';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import {TokenType} from '@/shared/api/gql/graphql.ts';
import {NotificationService} from '@/shared/api/notification';

type TokenRemoveListener = () => void;
let tokenRemoveListeners: TokenRemoveListener[] = [];

type EventHandler<T extends WebViewEventType> = (
  payload: WebViewEventPayloads[T],
) => void;

export class AuthBridge {
  static addTokenRemoveListener(listener: TokenRemoveListener) {
    tokenRemoveListeners.push(listener);
  }
  static removeTokenRemoveListener(listener: TokenRemoveListener) {
    tokenRemoveListeners = tokenRemoveListeners.filter(l => l !== listener);
  }

  static login: EventHandler<WebViewEventType.LOGIN_SUCCESS> =
    async payload => {
      const data = payload.data;
      await setAsyncStorage(StorageKey.ACCESS_TOKEN, data.accessToken);
      await setAsyncStorage(StorageKey.REFRESH_TOKEN, data.refreshToken);
      const token = await getAsyncStorage(StorageKey.FCM_DEVICE_TOKEN);
      await NotificationService.addToken({
        token,
        tokenType: TokenType.Fcm,
      }).then(console.log);
    };

  static tokenRefresh: EventHandler<WebViewEventType.TOKEN_REFRESH> =
    payload => {
      console.log('Token refreshed:', payload);
    };

  static tokenRemove: EventHandler<WebViewEventType.TOKEN_REMOVE> =
    async () => {
      tokenRemoveListeners.forEach(listener => listener());
      // await removeAsyncStorage(StorageKey.ACCESS_TOKEN);
      // await removeAsyncStorage(StorageKey.REFRESH_TOKEN);
      console.log('TOKEN_REMOVE!!!!');
    };
}
