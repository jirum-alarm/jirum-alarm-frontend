'use client';

import { m } from 'motion/react';

import customerService from '@/shared/lib/customerservice/customer-service';
import { ArrowRight, Headset } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { MYPAGE_MENU } from '../model/menu';

const MenuList = () => {
  const handleShowChannelTalkClick = () => {
    customerService.onShowMessenger();
  };
  return (
    <div className="px-5">
      {/* 아래에 아무것도 없는 자리의 구분선은 두지 않는다 — 마지막 행 밑에
          회색 선 + 빈 화면이라 목록이 끊긴 것처럼 보였다. */}
      <div className="py-4">
        <ul>
          {MYPAGE_MENU.filter((menu) => !menu.pcOnly).map((menu, i) => {
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
