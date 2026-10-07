'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { canAccessPath } from '@/lib/adminSection';

// 모바일 하단 탭 — 폰에서 자주 여는 화면만. 나머지는 '메뉴'(사이드바 서랍)로.
const TABS = [
  { name: '홈', href: '/', icon: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z' },
  { name: '매칭', href: '/product/matching', icon: 'M9 12l2 2 4-4M4 5h16v14H4z' },
  { name: '상품', href: '/product/list', icon: 'M4 6h16M4 12h16M4 18h10' },
  { name: '통계', href: '/stats', icon: 'M5 20V10M12 20V4M19 20v-7' },
];

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

const Icon = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BottomNav = ({ onMenu }: { onMenu: () => void }) => {
  const pathname = usePathname();
  const { data } = useMyAdminAccess();
  const tabs = TABS.filter((t) => canAccessPath(data?.myAdminAccess, t.href));
  const item = 'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-999 flex border-t border-stroke bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`${item} ${isActive(pathname, t.href) ? 'text-primary' : 'text-body'}`}
        >
          <Icon d={t.icon} />
          {t.name}
        </Link>
      ))}
      <button type="button" onClick={onMenu} className={`${item} text-body`}>
        <Icon d="M4 6h16M4 12h16M4 18h16" />
        메뉴
      </button>
    </nav>
  );
};

export default BottomNav;
