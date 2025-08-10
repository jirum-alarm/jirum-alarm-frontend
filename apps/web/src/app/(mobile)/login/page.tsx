'use client';

import Button from '@/components/common/Button';
import { LoginIllust } from '@/components/common/icons/Illust';
import BasicLayout from '@/components/layout/BasicLayout';
import useMyRouter from '@/hooks/useMyRouter';

import Link from '@shared/ui/Link';

import AppDownloadCTA from './components/AppDownloadCTA';

const SIGNUP_PATH = '/signup';
const EMAIL_LOGIN_PATH = '/login/email';

const Login = () => {
  const router = useMyRouter();
  const handleCTAButton = () => {
    router.push(SIGNUP_PATH);
  };

  return (
    <BasicLayout hasBackButton fullScreen={true}>
      <div className="flex h-full flex-col justify-center">
        <div className="grid pb-4 text-center">
          <div>
            <div className="grid justify-center">
              <LoginIllust className="size-[120px]" />
            </div>
            <div>
              <p className="pt-5 text-[32px] font-bold">지름알림</p>
              <p className="pt-9">
                내가 찾는 모든 핫딜
                <br />
                누구보다 빠르게 알림받으세요!
              </p>
            </div>
            <div className="px-8 pt-12">
              <Button onClick={handleCTAButton} className="self-end">
                이메일로 시작하기
              </Button>
              <p className="pt-6 text-sm">
                이미 지름알림 회원이신가요?
                <Link href={EMAIL_LOGIN_PATH} className="-m-2 ml-1 p-2 text-primary-700">
                  로그인
                </Link>
              </p>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 m-auto flex w-full max-w-[600px] flex-col justify-between bg-white">
            <AppDownloadCTA />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default Login;
