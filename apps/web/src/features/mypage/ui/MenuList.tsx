'use client';

import { m } from 'motion/react';
import { useState } from 'react';

import { setColorScheme } from '@/shared/config/color-scheme';
import customerService from '@/shared/lib/customerservice/customer-service';
import {
  Alert,
  ArrowRight,
  Description,
  Filter,
  Headset,
  Heart,
  Setting,
} from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';
const MENU_LIST: Array<{
  icon: React.ReactNode;
  title: string;
  url: string;
}> = [
  {
    icon: (
      <div className="flex h-7 w-7 items-center justify-center">
        <Heart width={24} height={24} />
      </div>
    ),
    title: '찜 목록',
    url: '/like',
  },
  {
    icon: <Filter />,
    title: '관심 카테고리',
    url: '/mypage/categories',
  },
  {
    icon: <Alert />,
    title: '키워드 알림',
    url: '/mypage/keyword',
  },
  {
    icon: <Setting />,
    title: '알림 설정',
    url: '/mypage/notification',
  },
  {
    icon: <Description />,
    title: '약관 및 정책',
    url: '/mypage/terms-policies',
  },
];

const MenuList = ({ isDark }: { isDark: boolean }) => {
  const [dark, setDark] = useState(isDark);
  const handleShowChannelTalkClick = () => {
    customerService.onShowMessenger();
  };
  return (
    <div className="px-5">
      {/* 아래에 아무것도 없는 자리의 구분선은 두지 않는다 — 마지막 행 밑에
          회색 선 + 빈 화면이라 목록이 끊긴 것처럼 보였다. */}
      <div className="py-4">
        <ul>
          {MENU_LIST.map((menu, i) => {
            return (
              <li key={i}>
                <Link href={menu.url}>
                  {/* 이동하는 행은 chevron 을 준다 — 같은 화면에서 프로필 행만
                      갖고 있어 어디를 누를 수 있는지가 행마다 달라 보였다. */}
                  <div className="flex items-center gap-3 py-3">
                    {menu.icon}
                    <span className="flex-1 text-left text-gray-900">{menu.title}</span>
                    <ArrowRight />
                  </div>
                </Link>
              </li>
            );
          })}
          <li>
            {/* ponytail: Switch primitive 가 없어 PriceDropOnlyToggle 과 같은 checkbox+peer 모양. */}
            <label className="flex cursor-pointer items-center gap-3 py-3">
              <div className="flex h-7 w-7 items-center justify-center">
                <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="flex-1 text-left text-gray-900">다크 모드</span>
              <input
                type="checkbox"
                className="peer hidden"
                checked={dark}
                onChange={(e) => {
                  setDark(e.target.checked);
                  setColorScheme(e.target.checked);
                }}
              />
              <span className="peer-checked:bg-primary-500 relative h-6 w-11 shrink-0 rounded-full bg-gray-300 transition-colors peer-checked:[&>span]:translate-x-5">
                <span className="bg-fixed-white absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow transition-transform" />
              </span>
            </label>
          </li>
          <li>
            <m.button
              className="w-full rounded-lg"
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
            >
              {/* 위 Link 행들은 px 이 없다 — px-2 를 두면 고객센터만 8px 들여써진다. */}
              <div className="flex items-center gap-3 py-3" onClick={handleShowChannelTalkClick}>
                {<Headset />}
                <span className="flex-1 text-left text-gray-900">고객센터</span>
              </div>
            </m.button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MenuList;
