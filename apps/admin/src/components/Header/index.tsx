'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import useLogout from '@/hooks/useLogout';

import SvgLogo from '../icons/Logo';
import { pageTitleOf } from '../Sidebar';

// 모바일 메뉴는 하단 탭바의 '메뉴'가 연다 — 헤더엔 지금 화면 이름만
const Header = () => {
  const { logout } = useLogout();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white pt-[env(safe-area-inset-top)] drop-shadow-1">
      <div className="flex grow items-center justify-between gap-3 px-4 py-2.5 shadow-2 md:px-6 lg:py-4 2xl:px-11">
        <Link className="flex min-w-0 items-center gap-2 lg:hidden" href="/">
          <SvgLogo width={30} height={30} className="shrink-0" />
          <span className="truncate text-base font-semibold text-black">
            {pageTitleOf(pathname)}
          </span>
        </Link>
        <button
          className="ml-auto shrink-0 rounded-md p-2 text-sm hover:bg-slate-100"
          onClick={logout}
        >
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;
