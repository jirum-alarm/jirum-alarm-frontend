import BasicLayout from '@shared/ui/layout/BasicLayout';

import EmailLogin from '@features/auth/login/ui/EmailLogin';

const LoginEmail = () => {
  return (
    <BasicLayout hasBackButton title="로그인">
      <EmailLogin />
    </BasicLayout>
  );
};

export default LoginEmail;
