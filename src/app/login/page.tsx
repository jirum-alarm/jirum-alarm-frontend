'use client';

import Button from '@/components/common/Button';
import Illust from '@/components/common/Illust';
import BasicLayout from '@/components/layout/BasicLayout';
import Link from '@/features/Link';
import { useRouter } from 'next/navigation';

const SIGNUP_PATH = '/signup';
const EMAIL_LOGIN_PATH = '/login/email';

const Login = () => {
  const router = useRouter();
  const handleCTAButton = () => {
    router.push(SIGNUP_PATH);
  };

  return (
    <BasicLayout hasBackButton fullScreen={true}>
      <div className="flex min-h-[calc(100dvh-56px)] flex-col pt-14 text-center">
        <div className="flex h-full flex-1 flex-col items-center justify-center">
          <div className="pb-4">
            <Illust size="sm" />
          </div>
          <div className="pb-8">
            <p className="pb-2 text-[32px] font-semibold text-gray-900">지름알림</p>
            <p className="text-gray-900">
              내가 찾는 모든 핫딜
              <br />
              누구보다 빠르게 알림받으세요!
            </p>
          </div>
        </div>
        <div className="w-full max-w-[480px] px-5 pb-9">
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
    </BasicLayout>
  );
};

export default Login;
