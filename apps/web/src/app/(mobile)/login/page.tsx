'use client';

import { StandingIllust } from '@/components/common/icons/Illust';
import SvgEmail from '@/components/common/icons/login/Email';
import SvgKakao from '@/components/common/icons/login/Kakao';
import SvgNaver from '@/components/common/icons/login/Naver';
import BasicLayout from '@/components/layout/BasicLayout';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter, { MyRouter } from '@/hooks/useMyRouter';
import { cn } from '@/lib/cn';

import AppDownloadCTA from './components/AppDownloadCTA';

const EMAIL_LOGIN_PATH = '/login/email';

const LOGIN_BUTTONS = [
  {
    name: '카카오로 시작하기',
    icon: <SvgKakao />,
    style: 'bg-[#FBE84C] hover:bg-[#F5DC3D] text-gray-900',
    action: (router: MyRouter) => {
      // TODO: Implement Kakao login
      console.log('Kakao login');
    },
  },
  {
    name: '네이버로 시작하기',
    icon: <SvgNaver />,
    style: 'bg-[#02C75A] hover:bg-[#00B04F] text-white',
    action: (router: MyRouter) => {
      // TODO: Implement Naver login
      console.log('Naver login');
    },
  },
  {
    name: '이메일로 시작하기',
    icon: <SvgEmail />,
    style: 'hover:bg-[#E4E7EC] border-[1px] border-[#E4E7EC] text-gray-900',
    action: (router: MyRouter) => {
      router.push(EMAIL_LOGIN_PATH);
    },
  },
];

const Login = () => {
  const { device, isHydrated } = useDevice();

  const router = useMyRouter();

  return (
    <BasicLayout hasBackButton fullScreen={true}>
      <div className="flex h-full flex-col justify-center px-8">
        <div className="flex flex-col items-center text-center">
          {/* Character Icon */}
          <div className="mb-3">
            <StandingIllust className="size-[100px]" />
          </div>

          {/* Title */}
          <div className="mb-12">
            <p className="text-[28px] leading-[130%] font-bold tracking-[-1%]">핫딜의 시작</p>
            <p className="text-[38px] leading-[130%] font-bold tracking-[-1%] text-gray-900">
              지름알림
            </p>
          </div>

          {/* Login Buttons */}
          <div className="flex flex-col items-center gap-2">
            {LOGIN_BUTTONS.map((button) => (
              <button
                key={button.name}
                onClick={() => button.action(router)}
                className={cn(
                  'flex h-[48px] w-[280px] items-center justify-center gap-2 rounded-[230px] font-semibold text-gray-900 transition-colors',
                  button.style,
                )}
              >
                {button.icon}
                {button.name}
              </button>
            ))}
          </div>
        </div>

        {device.isMobileBrowser && isHydrated && (
          <div className="bottom-safe-bottom fixed right-0 left-0 m-auto flex w-full max-w-[600px] flex-col justify-between bg-white">
            <AppDownloadCTA device={device} />
          </div>
        )}
      </div>
    </BasicLayout>
  );
};

export default Login;
