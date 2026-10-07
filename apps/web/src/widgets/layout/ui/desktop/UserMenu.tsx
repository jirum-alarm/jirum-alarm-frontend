'use client';

import { useQuery } from '@tanstack/react-query';
import { DropdownMenu } from 'radix-ui';

import { setColorScheme } from '@/shared/config/color-scheme';
import { PAGE } from '@/shared/config/page';
import { useLogout } from '@/shared/hooks/useLogout';
import { cn } from '@/shared/lib/cn';
import { trackAlarmLink } from '@/shared/lib/trackAlarmLink';
import { ArrowDown, My } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';

import { MYPAGE_GROUPS, MYPAGE_MENU } from '@/features/mypage/model/menu';

const itemClass =
  'flex w-full cursor-pointer items-center rounded-lg px-2.5 py-1.5 text-sm text-gray-900 outline-none data-[highlighted]:bg-gray-50';
const segClass =
  'rounded-md px-2 py-0.5 text-xs text-gray-500 outline-none data-[highlighted]:ring-1 data-[highlighted]:ring-gray-300';

/**
 * GNB 👤 메뉴 — 마이페이지 사이드바와 같은 묶음(지원 묶음은 사이드바에만) + 화면 모드 + 로그아웃.
 * 화면 모드 선택 표시는 ColorSchemeButton 처럼 html.dark 를 CSS(`dark:`)로 가른다(JS 상태 없음).
 */
export default function UserMenu({ color }: { color: string }) {
  const { data } = useQuery(AuthQueries.me());
  const me = data?.me;
  const logout = useLogout();

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        aria-label="내 메뉴"
        className="flex items-center gap-0.5 rounded-full py-0.5 pr-1 pl-0.5 duration-300 outline-none hover:bg-gray-400/20 focus-visible:ring-2 focus-visible:ring-gray-400"
      >
        <My width={28} height={28} color={color} />
        <ArrowDown width={14} height={14} viewBox="0 0 24 24" color={color} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={10}
          className="z-[60] w-64 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link
              href={PAGE.MYPAGE_ACCOUNT}
              className="block rounded-lg px-2.5 pt-2 pb-2.5 outline-none data-[highlighted]:bg-gray-50"
            >
              <p className="truncate font-bold text-gray-900">{me?.nickname ?? ' '}</p>
              <p className="truncate text-xs text-gray-500">{me?.email ?? ' '}</p>
            </Link>
          </DropdownMenu.Item>
          {MYPAGE_GROUPS.filter((group) => group.key !== 'support').map((group) => (
            <DropdownMenu.Group key={group.key} className="mt-1 border-t border-gray-100 pt-1">
              <DropdownMenu.Label className="px-2.5 pt-1.5 pb-0.5 text-[11px] font-semibold text-gray-500">
                {group.label}
              </DropdownMenu.Label>
              {MYPAGE_MENU.filter((menu) => menu.group === group.key).map((menu) => (
                <DropdownMenu.Item key={menu.url} asChild>
                  <Link
                    href={menu.url}
                    className={itemClass}
                    onClick={menu.url === PAGE.ALARM ? () => trackAlarmLink('gnb_menu') : undefined}
                  >
                    {menu.title}
                  </Link>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Group>
          ))}
          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
          <div className="flex items-center justify-between px-2.5 py-1.5 text-sm text-gray-900">
            화면 모드
            <div className="flex rounded-lg bg-gray-100 p-0.5">
              <DropdownMenu.Item
                className={cn(
                  segClass,
                  'bg-white font-semibold text-gray-900 shadow-xs dark:bg-transparent dark:font-normal dark:text-gray-500 dark:shadow-none',
                )}
                onSelect={(e) => {
                  e.preventDefault(); // 고르고 나서도 메뉴를 열어 둔다 — 바뀐 화면을 보며 다시 고를 수 있게.
                  setColorScheme(false);
                }}
              >
                라이트
              </DropdownMenu.Item>
              <DropdownMenu.Item
                className={cn(
                  segClass,
                  'dark:bg-white dark:font-semibold dark:text-gray-900 dark:shadow-xs',
                )}
                onSelect={(e) => {
                  e.preventDefault();
                  setColorScheme(true);
                }}
              >
                다크
              </DropdownMenu.Item>
            </div>
          </div>
          {/* ponytail: 확인 창 없이 바로 로그아웃 — 다시 로그인하면 되돌릴 수 있고, 마이페이지 가입 정보의 로그아웃은 확인 창을 유지한다. */}
          <DropdownMenu.Item className={cn(itemClass, 'text-gray-600')} onSelect={logout}>
            로그아웃
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
