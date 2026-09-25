/**
 * FCM 이 토큰을 교체하면(onTokenRefresh) 새 토큰을 바로 서버에 올린다.
 * 안 그러면 다음 콜드 스타트까지 푸시가 옛(죽은) 토큰으로 가서 사라진다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

type RefreshListener = (token: string) => void;
let mockRefreshListener: RefreshListener | undefined;
const mockUnsubscribe = jest.fn();

jest.mock('@react-native-firebase/messaging', () => {
  const messaging = () => ({
    requestPermission: () => Promise.resolve(0),
    registerDeviceForRemoteMessages: () => Promise.resolve(),
    onTokenRefresh: (listener: RefreshListener) => {
      mockRefreshListener = listener;
      return mockUnsubscribe;
    },
  });
  messaging.AuthorizationStatus = {AUTHORIZED: 1, PROVISIONAL: 2};
  return {__esModule: true, default: messaging};
});

const mockSaveAndRegister = jest.fn((_: string) => Promise.resolve());
jest.mock('../src/shared/lib/fcm/push-permission', () => ({
  registerFcmToken: jest.fn(() => Promise.resolve()),
  saveAndRegisterFcmToken: (token: string) => mockSaveAndRegister(token),
}));

import useFCMTokenManager from '../src/shared/hooks/useFCMTokenManager';

function Harness() {
  useFCMTokenManager();
  return null;
}

it('교체된 토큰을 저장·등록하고, 언마운트하면 구독을 푼다', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<Harness />);
  });

  mockRefreshListener?.('new-token');
  expect(mockSaveAndRegister).toHaveBeenCalledWith('new-token');

  await ReactTestRenderer.act(async () => {
    renderer?.unmount();
  });
  expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
});
