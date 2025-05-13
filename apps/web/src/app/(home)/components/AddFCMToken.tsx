'use client';

import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect } from 'react';

import { TokenType } from '@/shared/api/gql/graphql';
import { NotificationService } from '@/shared/api/notification';
import { fcmTokenAtom } from '@/state/fcmToken';

const AddFCMToken = () => {
  const [token] = useQueryState('token');
  const [fcmToken, setFcmToken] = useAtom(fcmTokenAtom);

  const { mutate: addPushToken } = useMutation({
    mutationFn: NotificationService.addPushToken,
    onError: (e) => {
      console.error(e);
    },
  });

  const addTokenToServer = useCallback(
    (token: string) => {
      addPushToken({
        token: token,
        tokenType: TokenType.Fcm,
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
