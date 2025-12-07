'use client';

import { useQueryState } from 'nuqs';
import { PropsWithChildren } from 'react';

import { PAGE } from '@shared/config/page';
import Link from '@shared/ui/Link';

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
