import { ToastProvider } from '@/components/Toast';

import Signin from './components/Signin';

const SignInPage = async () => {
  return (
    <div className="flex h-screen w-full items-center justify-center p-5">
      <div className="h-fit w-full max-w-[500px]">
        {/* 로그인 화면은 DefaultLayout 밖이라 토스트 공급자를 따로 둔다 */}
        <ToastProvider>
          <Signin />
        </ToastProvider>
      </div>
    </div>
  );
};

export default SignInPage;
