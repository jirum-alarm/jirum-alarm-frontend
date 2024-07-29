'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { QueryMe } from '../../../../graphql/auth';
import { userState } from '../../../../state/user';
import { User } from '../../../../types/user';
import { useQuery } from '@apollo/client';
import { setAccessToken, setRefreshToken } from '@/app/actions/token';
import { PAGE } from '@/constants/page';

export default function OauthLoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setUser = useSetRecoilState(userState);

  const accessToken = searchParams.get('accessToken');
  const refreshToken = searchParams.get('refreshToken');

  const { data } = useQuery<{ me: User }>(QueryMe);

  if (accessToken) {
    setAccessToken(accessToken);
  }

  if (refreshToken) {
    setRefreshToken(refreshToken);
  }

  useEffect(() => {
    if (data) {
      setUser(data.me);
    }

    router.push(PAGE.HOME);
    return;
  }, []);
}
