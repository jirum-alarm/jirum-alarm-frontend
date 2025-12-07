'use client';

import customerService from '@shared/lib/customerservice/customer-service';
import { Alert, Description, Filter, Headset, Heart } from '@shared/ui/icons';
import Link from '@shared/ui/Link';
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
    icon: <Description />,
    title: '약관 및 정책',
    url: '/mypage/terms-policies',
  },
];

const MenuList = () => {
  const handleShowChannelTalkClick = () => {
    customerService.onShowMessenger();
  };
  return (
    <div className="px-5">
      <div className="border-b border-gray-300 py-4">
        <ul>
          {MENU_LIST.map((menu, i) => {
            return (
              <li key={i}>
                <Link href={menu.url}>
                  <div className="flex items-center gap-3 py-3">
                    {menu.icon}
                    <span className="text-gray-900">{menu.title}</span>
                  </div>
                </Link>
              </li>
            );
          })}
          <li>
            <button className="w-full">
              <div className="flex items-center gap-3 py-3" onClick={handleShowChannelTalkClick}>
                {<Headset />}
                <span className="text-gray-900">고객센터</span>
              </div>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default MenuList;
