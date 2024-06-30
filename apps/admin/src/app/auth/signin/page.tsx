import { getAccessToken } from '@/app/actions/token';
import SigninPage from './components/SigninPage';

const SignIn = async () => {
  return (
    <div className="p-20">
      <SigninPage />
    </div>
  );
};

export default SignIn;
