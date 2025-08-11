'use client';

import { useMutation } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useQueryState } from 'nuqs';
import { useEffect } from 'react';

import { fcmTokenAtom } from '@/state/fcmToken';

import { MutationAddPushTokenMutationVariables, TokenType } from '@shared/api/gql/graphql';
import { NotificationService } from '@shared/api/notification/notification.service';

const AddFCMToken = () => {
  const [token] = useQueryState('token');
  const [fcmToken, setFcmToken] = useAtom(fcmTokenAtom);

  const { mutate: addPushToken } = useMutation({
    mutationFn: (variables: MutationAddPushTokenMutationVariables) =>
      NotificationService.addPushToken(variables),
    onError: (e) => console.error(e),
  });

  useEffect(() => {
    const fcmAppToken = token;
    setFcmToken(fcmAppToken ?? undefined);
    if (!fcmAppToken) return;
    addPushToken({ token: fcmAppToken, tokenType: TokenType.Fcm });
  }, [addPushToken, token, setFcmToken]);

  useEffect(() => {
    if (!fcmToken) return;
    addPushToken({ token: fcmToken, tokenType: TokenType.Fcm });
  }, [addPushToken, fcmToken]);

  return null;
};

export default AddFCMToken;
