'use client';

import Link from 'next/link';

const links = [
  { name: '핫딜 키워드', href: '/hotdeal/keyword', description: '핫딜 키워드 관리' },
  { name: '상품 매칭', href: '/product/matching', description: '상품 매칭 검증' },
  { name: '상품 관리', href: '/product/list', description: '상품 목록 조회' },
  { name: '사용자 관리', href: '/user', description: '사용자 목록 조회' },
  { name: '알림 관리', href: '/notification', description: '알림 발송 및 이력' },
];

const QuickLinks = () => {
  return (
    <div className="rounded-lg border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">빠른 링크</h4>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-stroke p-4 transition hover:border-primary hover:shadow-sm dark:border-strokedark dark:hover:border-primary"
          >
            <h5 className="mb-1 text-sm font-semibold text-black dark:text-white">{link.name}</h5>
            <p className="text-xs text-bodydark2">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
