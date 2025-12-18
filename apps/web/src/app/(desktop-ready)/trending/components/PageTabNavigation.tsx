'use client';

import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

const PageTabNavigation = () => {
  const pathname = usePathname();

  const isLive = pathname.includes('/live');
  const isRanking = pathname.includes('/ranking');

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="flex">
        <Link
          href="/trending/live"
          replace={true}
          className={cn(
            'relative flex-1 py-3 text-center text-base font-medium transition-colors',
            isLive ? 'text-gray-900' : 'text-gray-500',
          )}
        >
          실시간
          {isLive && <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gray-900" />}
        </Link>
        <Link
          href="/trending/ranking"
          replace={true}
          className={cn(
            'relative flex-1 py-3 text-center text-base font-medium transition-colors',
            isRanking ? 'text-gray-900' : 'text-gray-500',
          )}
        >
          랭킹
          {isRanking && <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gray-900" />}
        </Link>
      </div>
    </div>
  );
};

export default PageTabNavigation;
