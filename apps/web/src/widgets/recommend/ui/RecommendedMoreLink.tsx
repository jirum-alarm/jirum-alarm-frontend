'use client';

import { text } from '@jirum/design-system/recipes';
import * as m from 'motion/react-m';
import { useQueryState } from 'nuqs';
import { PropsWithChildren } from 'react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

const RecommendedMoreLink = ({
  children,
  'aria-label': ariaLabel,
}: PropsWithChildren<{ 'aria-label'?: string }>) => {
  const [recommend] = useQueryState('recommend');

  const hrefObject = {
    pathname: PAGE.RECOMMEND,
    query: recommend ? { recommend } : undefined,
  };

  return (
    <Link className={cn(text.muted, 'h-full')} href={hrefObject} aria-label={ariaLabel}>
      <m.div
        className="rounded-lg px-2 py-1"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </m.div>
    </Link>
  );
};

export default RecommendedMoreLink;
