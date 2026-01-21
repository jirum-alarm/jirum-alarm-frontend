'use client';

import { motion } from 'motion/react';

import { ArrowRight } from '@/components/common/icons';

export default function ReactionChartHeader({
  url,
  provider,
  lastUpdatedAt,
}: {
  url: string;
  provider: string;
  lastUpdatedAt: string | null;
}) {
  return (
    <div className="flex justify-between p-3">
      <div className="flex items-center text-gray-500">{lastUpdatedAt}</div>

      <div className="flex items-center gap-x-1.5">
        <motion.a
          className="text-secondary-500 text flex h-full items-center gap-x-1 rounded-lg px-2 py-1 font-semibold"
          href={url}
          aria-label={`${provider ?? '커뮤니티'} 반응 보기`}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <span>{provider ?? '커뮤니티'} 반응 보기</span>
          <span className="bg-secondary-500 flex size-5 items-center justify-center rounded-3xl">
            <ArrowRight color="#FFFFFF" width={16} height={16} strokeWidth={1.5} />
          </span>
        </motion.a>
      </div>
    </div>
  );
}
