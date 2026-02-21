'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

interface InteractiveMoreLinkProps {
  href: any;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}

export default function InteractiveMoreLink({
  href,
  className,
  children,
  'aria-label': ariaLabel,
}: InteractiveMoreLinkProps) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }} className="rounded-lg">
      <Link href={href} className={cn('px-2 py-1', className)} aria-label={ariaLabel}>
        {children}
      </Link>
    </motion.div>
  );
}
