import EmailLogin from './components/EmailLogin';

import BasicLayout from '@/components/layout/BasicLayout';

const LoginEmail = () => {
  return (
    <BasicLayout hasBackButton title="로그인">
      <EmailLogin />
    </BasicLayout>
  );
};

export default LoginEmail;
