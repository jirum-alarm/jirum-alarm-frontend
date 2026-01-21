'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

interface InteractiveMoreLinkProps {
  href: any;
  className?: string;
  children: ReactNode;
}

export default function InteractiveMoreLink({
  href,
  className,
  children,
}: InteractiveMoreLinkProps) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }} className="rounded-lg">
      <Link href={href} className={cn('px-2 py-1', className)}>
        {children}
      </Link>
    </motion.div>
  );
}
