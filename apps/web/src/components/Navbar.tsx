'use client';

import Link from '@/features/Link';
import { Alert, Logo, My } from '@/components/common/icons';
import { useQuery } from '@apollo/client';
import { QueryUnreadNotificationsCount } from '@/graphql/notification';
import { UnreadNotificationsCount } from '@/graphql/interface';
import { useMe } from '@/features/users';

const LOGIN_PATH = '/login';
const MYPAGE_PATH = '/mypage';
const ALARM_PATH = '/alarm';

export default function NavBar() {
  const { data } = useMe();
  const unreadNotificationsCount = useQuery<{ unreadNotificationsCount: UnreadNotificationsCount }>(
    QueryUnreadNotificationsCount,
    { skip: !data?.me },
  );

  return (
    <div className="flex items-center justify-between pt-6">
      <Link href="/">
        <div className="grid grid-flow-col items-center gap-x-3">
          <Logo />
          <h1 className="text-lg font-semibold">지름알림</h1>
        </div>
      </Link>
      <div className="w-3/12" />
      <div className="flex w-3/12 justify-end gap-x-3">
        <Link href={ALARM_PATH} className="relative">
          {unreadNotificationsCount.data?.unreadNotificationsCount ? (
            <div className="absolute left-[15.5px] top-[4.6px] h-1.5 w-1.5 animate-fade-in rounded-full bg-error-500"></div>
          ) : undefined}
          <Alert />
        </Link>
        <Link href={data?.me ? MYPAGE_PATH : LOGIN_PATH}>
          <My />
        </Link>
      </div>
    </div>
  );
}
