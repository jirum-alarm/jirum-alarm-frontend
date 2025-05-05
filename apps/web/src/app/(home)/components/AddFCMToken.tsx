'use client';

import { useMutation } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { TokenType, addPushTokenVariable } from '@/graphql/interface';
import { MutationAddPushToken } from '@/graphql/notification';
import { fcmTokenAtom } from '@/state/fcmToken';

const AddFCMToken = () => {
  const searchParams = useSearchParams();
  const [fcmToken, setFcmToken] = useRecoilState(fcmTokenAtom);

  const [addPushToken] = useMutation<unknown, addPushTokenVariable>(MutationAddPushToken, {
    onError: (e) => {
      console.error(e);
    },
  });

  const addTokenToServer = useCallback((token: string) => {
    addPushToken({
      variables: {
        token: token,
        tokenType: TokenType.FCM,
      },
    });
  }, []);

  useEffect(() => {
    const fcmAppToken = searchParams.get('token');
    setFcmToken(fcmAppToken);
    if (!fcmAppToken) return;
    addTokenToServer(fcmAppToken);
  }, [addTokenToServer, searchParams, setFcmToken]);

  useEffect(() => {
    if (!fcmToken) return;
    addTokenToServer(fcmToken);
  }, [addTokenToServer, fcmToken]);

  return null;
};

export default AddFCMToken;
