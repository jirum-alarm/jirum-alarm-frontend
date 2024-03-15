'use client';
import { TokenType, addPushTokenVariable } from '@/graphql/interface';
import { MutationAddPushToken } from '@/graphql/notification';
import { fcmTokenAtom } from '@/state/fcmToken';
import { useMutation } from '@apollo/client';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useRecoilValue } from 'recoil';

const AddFCMToken = () => {
  const searchParams = useSearchParams();
  const fcmWebToken = useRecoilValue(fcmTokenAtom);

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
    if (!fcmAppToken) return;
    addTokenToServer(fcmAppToken);
  }, [addTokenToServer, searchParams]);

  useEffect(() => {
    if (!fcmWebToken) return;
    addTokenToServer(fcmWebToken);
  }, [addTokenToServer, fcmWebToken]);

  return null;
};

export default AddFCMToken;
