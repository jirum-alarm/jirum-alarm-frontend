import BasicLayout from '@/components/layout/BasicLayout';
import EmailLogin from './components/EmailLogin';

const LoginEmail = () => {
  return (
    <BasicLayout hasBackButton title="로그인">
      <EmailLogin />
    </BasicLayout>
  );
};

export default LoginEmail;
