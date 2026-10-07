'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import customerService from '@/shared/lib/customerservice/customer-service';
import CustomerServiceBoot from '@/shared/lib/customerservice/CustomerServiceBoot';
import { Alert, Headset } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';

import { MYPAGE_MENU } from '../model/menu';

const rowClass = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-gray-900';

/** PC 마이페이지 왼쪽 메뉴. 모바일은 마이페이지 첫 화면의 MenuList 가 같은 역할. */
export default function MyPageSidebar() {
  const pathName = usePathname();
  // suspense 아님 — /like 처럼 me 를 prefetch 하지 않는 화면에서도 메뉴는 바로 그린다.
  const { data } = useQuery(AuthQueries.me());
  const me = data?.me;
  const isActive = (url: string) => pathName === url || pathName.startsWith(`${url}/`);

  return (
    <aside className="sticky top-14 w-60 shrink-0 self-start pt-8 pb-16">
      {/* 고객센터(채널톡)는 boot 돼야 열린다 — 모바일은 마이페이지 첫 화면만 boot 하지만 PC 는 사이드바가 어디서나 버튼을 보여준다. */}
      <CustomerServiceBoot />
      <Link
        href={PAGE.MYPAGE_ACCOUNT}
        className={cn(
          'block rounded-xl border border-gray-200 px-4 py-4 hover:bg-gray-50',
          isActive(PAGE.MYPAGE_ACCOUNT) && 'border-gray-900',
        )}
      >
        <p className="truncate font-bold text-gray-900">{me?.nickname ?? '\u00a0'}</p>
        <p className="truncate text-xs text-gray-500">{me?.email ?? '\u00a0'}</p>
        <p className="pt-2 text-xs font-medium text-gray-700">가입 정보 ›</p>
      </Link>
      <nav className="pt-4">
        <ul className="flex flex-col gap-0.5">
          {/* 알림함은 마이페이지 메뉴가 아니라 별도 탭(모바일)·GNB 아이콘이지만, PC 에선 같은 틀에 둔다. */}
          <li className="mb-2 border-b border-gray-200 pb-2">
            <Link
              href={PAGE.ALARM}
              className={cn(rowClass, 'hover:bg-gray-50', {
                'bg-gray-100 font-semibold': isActive(PAGE.ALARM),
              })}
            >
              <Alert />
              알림
            </Link>
          </li>
          {MYPAGE_MENU.map((menu) => (
            <li key={menu.url}>
              <Link
                href={menu.url}
                className={cn(rowClass, 'hover:bg-gray-50', {
                  'bg-gray-100 font-semibold': isActive(menu.url),
                })}
              >
                {menu.icon}
                {menu.title}
              </Link>
            </li>
          ))}
          <li>
            <button
              className={cn(rowClass, 'hover:bg-gray-50')}
              onClick={() => customerService.onShowMessenger()}
            >
              <Headset />
              고객센터
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
