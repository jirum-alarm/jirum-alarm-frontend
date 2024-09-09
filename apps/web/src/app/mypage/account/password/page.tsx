'use client';
import { Suspense } from 'react';

import PasswordContainerPage from './components/PasswordContainer';

import BasicLayout from '@/components/layout/BasicLayout';

const PasswordPage = () => {
  return (
    <BasicLayout title="비밀번호 변경" hasBackButton>
      <Suspense>
        <PasswordContainerPage />
      </Suspense>
    </BasicLayout>
  );
};

export default PasswordPage;
