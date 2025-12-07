import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import AccountContainer from './components/AccountContainer';

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
