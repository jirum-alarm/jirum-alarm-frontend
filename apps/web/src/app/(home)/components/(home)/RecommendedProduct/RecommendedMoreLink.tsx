'use client';
import React, { PropsWithChildren } from 'react';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import useTabQueryString from '@/hooks/useTabQueryString';

const RecommendedMoreLink = ({ children }: PropsWithChildren) => {
  const { currentTab } = useTabQueryString('keyword');
  const queryString = currentTab ? `?keyword=${currentTab}` : '';
  return (
    <Link className="text-sm text-gray-500" href={`${PAGE.RECOMMEND}${queryString}`}>
      {children}
    </Link>
  );
};

export default RecommendedMoreLink;
