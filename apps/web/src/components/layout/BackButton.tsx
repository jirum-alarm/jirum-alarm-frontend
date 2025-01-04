'use client';
import React from 'react';

import { ArrowLeft } from '../common/icons';

import { PAGE } from '@/constants/page';
import useGoBack from '@/hooks/useGoBack';

const BackButton = ({ backTo }: { backTo?: PAGE }) => {
  const goBack = useGoBack(backTo);

  return (
    <button className="p-2" onClick={goBack} aria-label="뒤로 가기" title="뒤로 가기">
      <ArrowLeft width={28} height={28} />
    </button>
  );
};

export default BackButton;
