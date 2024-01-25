'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Logo, My } from '@/components/common/icons';
import { QueryMe } from '../graphql/auth';
import { useLazyApiQuery } from '../hooks/useGql';
import { userState } from '../state/user';
import { StorageTokenKey } from '../types/enum/auth';
import { User } from '../types/user';

const LOGIN_PATH = '/login';
const MYPAGE_PATH = '/mypage';

export default function NavBar() {
  const setUser = useSetRecoilState(userState);

  const user = useRecoilValue<User | null>(userState);

  const { getQuery } = useLazyApiQuery<{ me: User }>(QueryMe);

  useEffect(() => {
    const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN);
    if (token) {
      getQuery().then((response) => {
        if (response?.data?.me) {
          setUser(response.data.me);
          return;
        }

        setUser(null);
      });
    }

    if (!token) {
      setUser(null);
    }
  }, [getQuery, setUser]);

  return (
    <>
      <div className="px-4 pt-8">
        <div className="flex items-center justify-between">
          <div className="w-3/12" />
          <Link href="/">
            <div className="grid grid-flow-col items-center gap-x-3">
              <Logo />
              <h1 className="center flex text-center text-3xl">지름알림</h1>
            </div>
          </Link>
          <div className="flex w-3/12 justify-end">
            {user ? (
              <>
                <Link href={MYPAGE_PATH}>
                  <My />
                </Link>
              </>
            ) : user === null ? (
              <Link href={LOGIN_PATH}>
                <span>로그인</span>
              </Link>
            ) : undefined}
          </div>
        </div>
      </div>
    </>
  );
}
