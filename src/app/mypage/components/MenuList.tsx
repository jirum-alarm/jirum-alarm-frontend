'use client';
import { Alert, Description, Filter, Headset } from '@/components/common/icons';
import customerService from '@/lib/customerservice/customer-service';
import Link from 'next/link';
import { createElement } from 'react';

const mypageMenuListMap = [
  {
    icon: Filter,
    title: '관심 카테고리',
    url: '/mypage/categories',
  },
  // {
  //   icon: Alert,
  //   title: '알림 설정',
  // },
  {
    icon: Description,
    title: '약관 및 정책',
    url: '/mypage/terms-policies',
  },
] as const;

const MenuList = () => {
  const handleShowChannelTalkClick = () => {
    customerService.onShowMessenger();
  };
  return (
    <div className="px-5">
      <div className="border-b border-gray-300 py-4">
        <ul>
          {mypageMenuListMap.map((menu, i) => (
            <>
              <li key={i}>
                <Link href={menu.url}>
                  <div className="flex items-center gap-3 py-3">
                    {createElement(menu.icon)}
                    <span className="text-gray-900">{menu.title}</span>
                  </div>
                </Link>
              </li>
            </>
          ))}
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
