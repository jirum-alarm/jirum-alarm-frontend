'use client';

import { useQueryState } from 'nuqs';
import { PropsWithChildren } from 'react';

import { PAGE } from '@/constants/page';
import Link from '@/features/Link';

const RecommendedMoreLink = ({ children }: PropsWithChildren) => {
  const [keyword] = useQueryState('keyword');
  const queryString = keyword ? `?keyword=${keyword}` : '';
  return (
    <Link className="text-sm text-gray-500" href={`${PAGE.RECOMMEND}${queryString}`}>
      {children}
    </Link>
  );
};

export default RecommendedMoreLink;
