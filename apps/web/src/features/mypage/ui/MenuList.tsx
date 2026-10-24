'use client';

import { listRow, text } from '@jirum/design-system/recipes';
import { CUSTOMER_SERVICE_TITLE } from '@jirum/domain/mypage';
import * as m from 'motion/react-m';

import { setColorScheme } from '@/shared/config/color-scheme';
import { cn } from '@/shared/lib/cn';
import customerService from '@/shared/lib/customerservice/customer-service';
import { ArrowRight, Headset, ThemeMode } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { MYPAGE_GROUPS, MYPAGE_MENU } from '../model/menu';

// 고르지 않은 쪽 모양이 기본 — 고른 쪽은 버튼마다 (dark:) 로 덮는다.
const segClass = cn(text.muted, 'rounded-md px-3 py-1 transition-colors');

const MenuList = () => {
  const handleShowChannelTalkClick = () => {
    customerService.onShowMessenger();
  };
  return (
    <div className="px-5">
      {/* 아래에 아무것도 없는 자리의 구분선은 두지 않는다 — 마지막 행 밑에
          회색 선 + 빈 화면이라 목록이 끊긴 것처럼 보였다. */}
      {/* PC 사이드바와 같은 묶음(내 핫딜 · 맞춤 설정 · 지원). 고객센터는 지원 맨 끝. */}
      <div className="flex flex-col gap-4 py-4">
        {MYPAGE_GROUPS.map((group) => (
          <section key={group.key}>
            <h2 className={listRow.group}>{group.label}</h2>
            <ul>
              {MYPAGE_MENU.filter((menu) => menu.group === group.key && !menu.pcOnly).map(
                (menu) => (
                  <li key={menu.url}>
                    <Link href={menu.url}>
                      {/* 이동하는 행은 chevron 을 준다 — 같은 화면에서 프로필 행만
                          갖고 있어 어디를 누를 수 있는지가 행마다 달라 보였다. */}
                      <div className={cn('flex', listRow.row)}>
                        {menu.icon}
                        <span className={cn('flex-1 text-left', listRow.title)}>{menu.title}</span>
                        <ArrowRight />
                      </div>
                    </Link>
                  </li>
                ),
              )}
              {/* 화면 모드 — 모바일 홈 헤더의 해/달 버튼이 2026-10-24 사용법에 자리를 넘겨 여기로(앱 내정보 「화면 모드」와 같은 자리).
                  고른 쪽 표시는 html.dark 를 CSS(`dark:`)로 가른다 — PC UserMenu 와 같은 방식(JS 상태 없음). */}
              {group.key === 'custom' && (
                <li className={cn('flex', listRow.row)}>
                  <ThemeMode />
                  <span className={cn('flex-1 text-left', listRow.title)}>화면 모드</span>
                  <div className="flex rounded-lg bg-gray-100 p-0.5">
                    <button
                      type="button"
                      aria-label="라이트 모드"
                      onClick={() => setColorScheme(false)}
                      className={cn(
                        segClass,
                        'bg-white font-semibold text-gray-900 shadow-xs dark:bg-transparent dark:font-normal dark:text-gray-500 dark:shadow-none',
                      )}
                    >
                      라이트
                    </button>
                    <button
                      type="button"
                      aria-label="다크 모드"
                      onClick={() => setColorScheme(true)}
                      className={cn(
                        segClass,
                        'dark:bg-white dark:font-semibold dark:text-gray-900 dark:shadow-xs',
                      )}
                    >
                      다크
                    </button>
                  </div>
                </li>
              )}
              {group.key === 'support' && (
                <li>
                  <m.button
                    type="button"
                    className="w-full rounded-lg"
                    onClick={handleShowChannelTalkClick}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                  >
                    {/* 위 Link 행들은 px 이 없다 — px-2 를 두면 고객센터만 8px 들여써진다. */}
                    <div className={cn('flex', listRow.row)}>
                      {<Headset />}
                      <span className={cn('flex-1 text-left', listRow.title)}>
                        {CUSTOMER_SERVICE_TITLE}
                      </span>
                    </div>
                  </m.button>
                </li>
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
};

export default MenuList;
