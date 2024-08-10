import BasicLayout from '@/components/layout/BasicLayout';
import { Suspense } from 'react';
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
