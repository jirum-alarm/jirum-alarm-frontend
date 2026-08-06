'use client';

import { motion } from 'motion/react';

import { cn } from '@/shared/lib/cn';
import { IconLogo } from '@/shared/ui/common/icons/Illust';
import Link from '@/shared/ui/Link';

/** 로고 아래 붙는 서비스 한 줄 설명. 로고가 보이는 곳이면 어디서든 같은 문구를 쓴다. */
export const LOGO_SUBTITLE = '커뮤니티 핫딜 모아보기';

interface LogoLinkProps {
  inverted?: boolean;
  /**
   * 로고 이름 아래 붙는 부제. 기본값은 LOGO_SUBTITLE 이라 로고를 쓰는 곳은 별도 지정 없이
   * 같은 문구를 얻는다. 높이가 빠듯한 자리(데스크톱 GNB 등)는 null 을 넘겨 한 줄로 되돌린다.
   */
  subtitle?: string | null;
}

export default function LogoLink({ inverted = false, subtitle = LOGO_SUBTITLE }: LogoLinkProps) {
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
