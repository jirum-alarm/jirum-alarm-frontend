'use client';
import React from 'react';
import { ArrowLeft } from '../common/icons';
import useGoBack from '@/hooks/useGoBack';
import { PAGE } from '@/constants/page';

const BackButton = ({ backTo }: { backTo?: PAGE }) => {
  const goBack = useGoBack(backTo);

  return (
    <button className="p-2" onClick={goBack}>
      <ArrowLeft />
    </button>
  );
};

export default BackButton;
