'use client';

import { TRENDING_VIEW_TABS } from '@jirum/domain/ranking';
import * as m from 'motion/react-m';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

const PageTabNavigation = () => {
  const pathname = usePathname();

  return (
    <div className="w-full border-b border-gray-200 bg-white">
      <div className="flex">
        {TRENDING_VIEW_TABS.map(({ view, label }) => {
          const isActive = pathname.includes(`/trending/${view}`);
          return (
            <Link key={view} href={`/trending/${view}`} className="relative flex-1 text-center">
              <m.div
                className={cn(
                  'py-3 text-base font-medium transition-colors',
                  isActive ? 'text-gray-900' : 'text-gray-500',
                )}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.1 }}
              >
                {label}
                {isActive && <div className="absolute right-0 bottom-0 left-0 h-0.5 bg-gray-900" />}
              </m.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default PageTabNavigation;
