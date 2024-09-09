import { Suspense } from 'react';

import AccountContainer from './components/AccountContainer';

import BasicLayout from '@/components/layout/BasicLayout';

const AccountPage = async () => {
  return (
    <BasicLayout hasBackButton title="가입 정보">
      <Suspense>
        <AccountContainer />
      </Suspense>
    </BasicLayout>
  );
};

export default AccountPage;
