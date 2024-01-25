'use client';

import Button from '@/components/common/Button';
import Illust from '@/components/common/Illust';
import BasicLayout from '@/components/layout/BasicLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const SIGNUP_PATH = '/signup';
const EMAIL_LOGIN_PATH = '/login/email';

const Login = () => {
  const router = useRouter();
  const handleCTAButton = () => {
    router.push(SIGNUP_PATH);
  };

  return (
    <BasicLayout fullScreen={false}>
      <div className="h-full px-5 py-9">
        <div className="grid h-full text-center">
          <div>
            <div className="grid justify-center pb-5">
              <Illust size="sm" />
            </div>
            <div>
              <p className="pb-3 text-[32px] font-semibold">지름알림</p>
              <p>
                내가 찾는 모든 핫딜
                <br />
                누구보다 빠르게 알림받으세요!
              </p>
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 m-auto w-full max-w-[480px] px-5 pb-9">
            <Button onClick={handleCTAButton} className="self-end">
              이메일로 시작하기
            </Button>
            <p className="pt-6 text-sm">
              이미 지름알림 회원이신가요?
              <Link href={EMAIL_LOGIN_PATH} className="pl-3 text-primary-700">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </BasicLayout>
  );
};

export default Login;
