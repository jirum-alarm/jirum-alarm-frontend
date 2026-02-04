'use client';

import { motion } from 'motion/react';
import { useQueryState } from 'nuqs';
import { PropsWithChildren } from 'react';

import { PAGE } from '@/shared/config/page';
import Link from '@/shared/ui/Link';

const RecommendedMoreLink = ({ children }: PropsWithChildren) => {
  const [recommend] = useQueryState('recommend');

  const hrefObject = {
    pathname: PAGE.RECOMMEND,
    query: recommend ? { recommend } : undefined,
  };

  return (
    <Link className="h-full text-sm text-gray-500" href={hrefObject}>
      <motion.div
        className="rounded-lg px-2 py-1"
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        {children}
      </motion.div>
    </Link>
  );
};

export default RecommendedMoreLink;
