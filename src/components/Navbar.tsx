'use client';

import Link from 'next/link';
import { Logo, My } from '@/components/common/icons';
import { QueryMe } from '../graphql/auth';
import { User } from '../types/user';
import { useQuery } from '@apollo/client';

const LOGIN_PATH = '/login';
const MYPAGE_PATH = '/mypage';

export default function NavBar() {
  const { data: me, loading } = useQuery<{ me: User }>(QueryMe);

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
            {loading ? undefined : me ? (
              <Link href={MYPAGE_PATH}>
                <My />
              </Link>
            ) : (
              <Link href={LOGIN_PATH}>
                <span>로그인</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
