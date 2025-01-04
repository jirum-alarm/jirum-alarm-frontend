'use client';
import React, { PropsWithChildren } from 'react';
import { PAGE } from '@/constants/page';
import Link from 'next/link';
import useTabQueryString from '@/hooks/useTabQueryString';

const RecommendedMoreLink = ({ children }: PropsWithChildren) => {
  const { currentTab } = useTabQueryString('keyword');
  return (
    <Link className="text-sm text-gray-500" href={`${PAGE.RECOMMEND}?keyword=${currentTab}`}>
      {children}
    </Link>
  );
};

export default RecommendedMoreLink;
