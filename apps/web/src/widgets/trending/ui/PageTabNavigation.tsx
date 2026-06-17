'use client';

import { motion } from 'motion/react';
import { usePathname } from 'next/navigation';

import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

const PageTabNavigation = () => {
  const pathname = usePathname();

  const isLive = pathname.includes('/live');
  const isRanking = pathname.includes('/ranking');

  return (
    <div className="border-border-default bg-surface-default w-full border-b">
      <div className="flex">
        <Link href="/trending/live" replace={true} className="relative flex-1 text-center">
          <motion.div
            className={cn(
              'typography-title-16m py-3 transition-colors',
              isLive ? 'text-gray-900' : 'text-gray-500',
            )}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            실시간
            {isLive && (
              <div className="bg-surface-inverse absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </motion.div>
        </Link>
        <Link href="/trending/ranking" replace={true} className="relative flex-1 text-center">
          <motion.div
            className={cn(
              'typography-title-16m py-3 transition-colors',
              isRanking ? 'text-gray-900' : 'text-gray-500',
            )}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.1 }}
          >
            랭킹
            {isRanking && (
              <div className="bg-surface-inverse absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

export default PageTabNavigation;
