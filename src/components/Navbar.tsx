'use client';

import Link from '@/features/Link';
import { Logo, My } from '@/components/common/icons';
import { QueryMe } from '../graphql/auth';
import { User } from '../types/user';
import { useQuery } from '@apollo/client';

const LOGIN_PATH = '/login';
const MYPAGE_PATH = '/mypage';

export default function NavBar() {
  const { data } = useQuery<{ me: User }>(QueryMe);

  return (
    <>
      <div className="pt-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="grid grid-flow-col items-center gap-x-3">
              <Logo />
              <h1 className="font-semibold">지름알림</h1>
            </div>
          </Link>
          <div className="w-3/12" />
          <div className="flex w-3/12 justify-end">
            <Link href={data?.me ? MYPAGE_PATH : LOGIN_PATH}>
              <My />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
