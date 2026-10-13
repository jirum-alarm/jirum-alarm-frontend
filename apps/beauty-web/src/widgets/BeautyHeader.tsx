import Link from 'next/link';

import { BEAUTY_ROUTE, SERVICE_ROUTE } from '@/shared/config/beauty';
import { cn } from '@/shared/lib/cn';
import { AlertIcon, ArrowLeftIcon, MyIcon, SearchIcon } from '@/shared/ui/icons';
import LogoIcon from '@/shared/ui/LogoIcon';
import ServiceLink from '@/shared/ui/ServiceLink';

const ACTION = '-m-1 p-1 text-gray-800';

/**
 * 「지름알림 뷰티」 헤더 — 로고는 본 서비스 것 + 「뷰티」 글자(apps/ai 헤더의 「AI」 배지와 같은 방식: 별도 서비스가
 * 아니라 지름알림의 뷰티로 읽히게). 로고 32 / 이름 text-lg 는 web 헤더(LogoLink)와 같은 비율.
 * 오른쪽 검색·알림·마이는 본 서비스 화면으로 간다(이번엔 뷰티 전용 계정 화면 없음).
 * backHref 가 있으면 왼쪽에 뒤로가기(랭킹 → 뷰티 홈).
 */
export default function BeautyHeader({ title, back }: { title?: string; back?: boolean }) {
  return (
    <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center gap-1.5 border-b border-gray-100 bg-white px-5">
      {back ? (
        <>
          <Link href={BEAUTY_ROUTE.HOME} aria-label="뷰티 홈으로" className={cn(ACTION, '-ml-2')}>
            <ArrowLeftIcon />
          </Link>
          <span className="text-lg font-bold text-gray-900">{title}</span>
        </>
      ) : (
        <Link
          href={BEAUTY_ROUTE.HOME}
          aria-label="지름알림 뷰티 홈"
          className="-ml-1 flex items-center gap-1.5"
        >
          <LogoIcon size={32} />
          <span className="text-lg leading-tight font-bold text-gray-900">지름알림</span>
          <span className="bg-error-500 text-fixed-white rounded px-1.5 py-0.5 text-xs leading-none font-bold">
            뷰티
          </span>
        </Link>
      )}

      <nav aria-label="지름알림 메뉴" className="ml-auto flex items-center gap-3">
        <ServiceLink href={SERVICE_ROUTE.SEARCH} aria-label="검색" title="검색" className={ACTION}>
          <SearchIcon />
        </ServiceLink>
        <ServiceLink href={SERVICE_ROUTE.ALARM} aria-label="알림" title="알림" className={ACTION}>
          <AlertIcon />
        </ServiceLink>
        <ServiceLink
          href={SERVICE_ROUTE.MYPAGE}
          aria-label="마이페이지"
          title="마이페이지"
          className={ACTION}
        >
          <MyIcon />
        </ServiceLink>
      </nav>
    </header>
  );
}
