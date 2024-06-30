import { getAccessToken } from '@/app/actions/token';
import SigninPage from './components/SigninPage';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

const SignIn = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <SigninPage />
    </DefaultLayout>
  );
};

export default SignIn;
