'use client';

import { useMutation } from '@apollo/client';
import { useAtom } from 'jotai';
import { useSearchParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect } from 'react';

import { addPushTokenVariable, TokenType } from '@/graphql/interface';
import { MutationAddPushToken } from '@/graphql/notification';
import { fcmTokenAtom } from '@/state/fcmToken';

const AddFCMToken = () => {
  const [token] = useQueryState('token');
  const [fcmToken, setFcmToken] = useAtom(fcmTokenAtom);

  const [addPushToken] = useMutation<unknown, addPushTokenVariable>(MutationAddPushToken, {
    onError: (e) => {
      console.error(e);
    },
  });

  const addTokenToServer = useCallback(
    (token: string) => {
      addPushToken({
        variables: {
          token: token,
          tokenType: TokenType.FCM,
        },
      });
    },
    [addPushToken],
  );

  useEffect(() => {
    const fcmAppToken = token;
    setFcmToken(fcmAppToken ?? undefined);
    if (!fcmAppToken) return;
    addTokenToServer(fcmAppToken);
  }, [addTokenToServer, token, setFcmToken]);

  useEffect(() => {
    if (!fcmToken) return;
    addTokenToServer(fcmToken);
  }, [addTokenToServer, fcmToken]);

  return null;
};

export default AddFCMToken;
