'use client';

import Link from '@/features/Link';
import { Alert, Logo, My } from '@/components/common/icons';
import { QueryMe } from '../graphql/auth';
import { User } from '../types/user';
import { useQuery } from '@apollo/client';
import { QueryUnreadNotificationsCount } from '@/graphql/notification';
import { UnreadNotificationsCount } from '@/graphql/interface';
import { isIOSFlutterWeb } from '@/util/ua';

const LOGIN_PATH = '/login';
const MYPAGE_PATH = '/mypage';
const ALARM_PATH = '/alarm';

export default function NavBar() {
  const { data } = useQuery<{ me: User }>(QueryMe);
  const unreadNotificationsCount = useQuery<{ unreadNotificationsCount: UnreadNotificationsCount }>(
    QueryUnreadNotificationsCount,
    { skip: !data?.me },
  );

  const layoutPaddingTop = isIOSFlutterWeb() ? 'pt-4' : 'pt-6';

  return (
    <>
      <div className={`${layoutPaddingTop}`}>
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="grid grid-flow-col items-center gap-x-3">
              <Logo />
              <h1 className="font-semibold">지름알림</h1>
            </div>
          </Link>
          <div className="w-3/12" />
          <div className="flex w-3/12 justify-end gap-x-3">
            {data?.me && (
              <Link href={ALARM_PATH} className="relative">
                {unreadNotificationsCount.data?.unreadNotificationsCount ? (
                  <div className="absolute left-[15.5px] top-[4.6px] h-1.5 w-1.5 animate-fade-in rounded-full bg-error-500"></div>
                ) : undefined}
                <Alert />
              </Link>
            )}
            <Link href={data?.me ? MYPAGE_PATH : LOGIN_PATH}>
              <My />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
