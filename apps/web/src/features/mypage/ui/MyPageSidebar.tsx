'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import customerService from '@/shared/lib/customerservice/customer-service';
import CustomerServiceBoot from '@/shared/lib/customerservice/CustomerServiceBoot';
import { Headset } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';

import { MYPAGE_GROUPS, MYPAGE_MENU } from '../model/menu';

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
          isActive(PAGE.MYPAGE_ACCOUNT) && 'border-gray-100 bg-gray-100', // 메뉴 줄과 같은 선택 표시(검은 테두리는 입력창 포커스처럼 보였다)
        )}
      >
        <p className="truncate font-bold text-gray-900">{me?.nickname ?? '\u00a0'}</p>
        <p className="truncate text-xs text-gray-500">{me?.email ?? '\u00a0'}</p>
        <p className="pt-2 text-xs font-medium text-gray-700">가입 정보 ›</p>
      </Link>
      <nav className="flex flex-col gap-5 pt-6">
        {MYPAGE_GROUPS.map((group) => (
          <section key={group.key}>
            <h2 className="px-3 pb-1 text-xs font-medium text-gray-500">{group.label}</h2>
            <ul className="flex flex-col gap-0.5">
              {MYPAGE_MENU.filter((menu) => menu.group === group.key).map((menu) => (
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
              {group.key === 'support' && (
                <li>
                  <button
                    className={cn(rowClass, 'hover:bg-gray-50')}
                    onClick={() => customerService.onShowMessenger()}
                  >
                    <Headset />
                    고객센터
                  </button>
                </li>
              )}
            </ul>
          </section>
        ))}
      </nav>
    </aside>
  );
}
