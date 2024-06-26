'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { QueryMe } from '../../../../graphql/auth';
import { useApiQuery } from '../../../../hooks/useGql';
import { userState } from '../../../../state/user';
import { StorageTokenKey } from '../../../../types/enum/auth';
import { User } from '../../../../types/user';

export default function OauthLoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setUser = useSetRecoilState(userState);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  const { data } = useApiQuery<{ me: User }>(QueryMe);

  if (accessToken) {
    localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, accessToken);
  }

  if (refreshToken) {
    localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, refreshToken);
  }

  useEffect(() => {
    if (data) {
      setUser(data.me);
    }

    router.push('/');
    return;
  }, []);
}
