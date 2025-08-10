'use client';

import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useQueryState } from 'nuqs';
import { useCallback, useEffect } from 'react';

import { fcmTokenAtom } from '@/state/fcmToken';

import { MutationAddPushTokenMutationVariables, TokenType } from '@shared/api/gql/graphql';
import { NotificationService } from '@shared/api/notification/notification.service';

const AddFCMToken = () => {
  const [token] = useQueryState('token');
  const [fcmToken, setFcmToken] = useAtom(fcmTokenAtom);

  const { mutate } = useMutation({
    mutationFn: (variables: MutationAddPushTokenMutationVariables) =>
      NotificationService.addPushToken(variables),
    onError: (e) => console.error(e),
  });

  const addTokenToServer = useCallback(
    (token: string) => {
      mutate({ token, tokenType: TokenType.Fcm });
    },
    [mutate],
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
