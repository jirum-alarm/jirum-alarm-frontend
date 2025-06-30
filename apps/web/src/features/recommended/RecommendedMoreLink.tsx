'use client';

import { useQueryState } from 'nuqs';
import { PropsWithChildren } from 'react';

import { PAGE } from '@/constants/page';
import Link from '@/features/Link';

const RecommendedMoreLink = ({ children }: PropsWithChildren) => {
  const [recommend] = useQueryState('recommend');

  const hrefObject = {
    pathname: PAGE.RECOMMEND,
    query: recommend ? { recommend } : undefined,
  };

  return (
    <Link className="h-full text-sm text-gray-500" href={hrefObject}>
      {children}
    </Link>
  );
};

export default RecommendedMoreLink;
