'use client';

import { motion } from 'motion/react';

import { IconLogo } from '@/components/common/icons/Illust';
import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

interface LogoLinkProps {
  inverted?: boolean;
}

export default function LogoLink({ inverted = false }: LogoLinkProps) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <motion.div
        className="flex items-center gap-2 rounded-lg px-2 py-1"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <IconLogo />
        <h2
          className={cn('relative text-lg font-bold', {
            'text-white': inverted,
            'text-gray-800': !inverted,
          })}
        >
          지름알림
        </h2>
      </motion.div>
    </Link>
  );
}
