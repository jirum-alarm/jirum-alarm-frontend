'use client';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';
import { IconLogo } from '@/shared/ui/common/icons/Illust';
import Link from '@/shared/ui/Link';

interface LogoLinkProps {
  inverted?: boolean;
  /**
   * 로고 이름 아래 붙는 부제. 상세 페이지처럼 "여기가 뭐 하는 곳인지" 알려야 하는
   * 유입면에서만 쓴다. 없으면 기존과 완전히 동일하게 렌더된다.
   */
  subtitle?: string;
}

export default function LogoLink({ inverted = false, subtitle }: LogoLinkProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <motion.div
        className="flex items-center gap-2 rounded-lg px-2 py-1"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <IconLogo />
        {/* 부제가 있으면 로고 이름과 세로로 묶는다. 아이콘은 그 묶음 왼쪽에 그대로 남아
            두 줄 모두의 기준선이 되므로 들여쓰기를 따로 계산할 필요가 없다.
            leading-tight 로 두 줄 높이를 h-14 안에 들어오게 잡는다. */}
        <span className="flex flex-col justify-center whitespace-nowrap">
          <h2
            className={cn('relative text-lg leading-tight font-bold', {
              'text-white': inverted,
              'text-gray-800': !inverted,
            })}
          >
            지름알림
          </h2>
          {subtitle && (
            <span
              className={cn('text-[11px] leading-tight', {
                'text-white/70': inverted,
                'text-gray-500': !inverted,
              })}
            >
              {subtitle}
            </span>
          )}
        </span>
      </motion.div>
    </Link>
  );
}
