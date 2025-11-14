'use client';

import { useState } from 'react';

import { StandingIllust } from '@/components/common/icons/Illust';
import LoadingSpinner from '@/components/common/icons/LoadingSpinner';
import SvgEmail from '@/components/common/icons/login/Email';
import SvgKakao from '@/components/common/icons/login/Kakao';
import SvgNaver from '@/components/common/icons/login/Naver';
import BasicLayout from '@/components/layout/BasicLayout';
import { PAGE } from '@/constants/page';
import { useKakaoLogin } from '@/features/auth/lib/use-kakao-login';
import { useNaverLogin } from '@/features/auth/lib/use-naver-login';
import { useDevice } from '@/hooks/useDevice';
import useMyRouter from '@/hooks/useMyRouter';
import { cn } from '@/lib/cn';

import AppDownloadCTA from './components/AppDownloadCTA';

enum LoginType {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  EMAIL = 'EMAIL',
}

type LoginButton = {
  name: string;
  id: string;
  icon: React.ReactNode;
  style: string;
  action: () => void;
  type: LoginType;
};

const Login = () => {
  const { device, isHydrated } = useDevice();
  const router = useMyRouter();
  const { executeKakaoLogin, isLoading: isKakaoLoading } = useKakaoLogin();
  const { executeNaverLogin, isLoading: isNaverLoading } = useNaverLogin();
  const [loadingButton, setLoadingButton] = useState<LoginType | null>(null);

  const handleKakaoLogin = async () => {
    try {
      setLoadingButton(LoginType.KAKAO);
      await executeKakaoLogin();
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
    } finally {
      setLoadingButton(null);
    }
  };

  const handleNaverLogin = async () => {
    try {
      setLoadingButton(LoginType.NAVER);
      await executeNaverLogin();
    } catch (error) {
      console.error('네이버 로그인 실패:', error);
    } finally {
      setLoadingButton(null);
    }
  };

  const handleEmailLogin = () => {
    router.push(PAGE.LOGIN_BY_EMAIL);
  };

  const LOGIN_BUTTONS: LoginButton[] = [
    {
      name: '카카오로 시작하기',
      id: 'kakao-login-button',
      icon: <SvgKakao />,
      style: 'bg-[#FBE84C] hover:bg-[#F5DC3D] text-gray-900',
      action: handleKakaoLogin,
      type: LoginType.KAKAO,
    },
    {
      name: '네이버로 시작하기',
      id: 'naver_id_login',
      icon: <SvgNaver />,
      style: 'bg-[#02C75A] hover:bg-[#00B04F] text-white',
      action: handleNaverLogin,
      type: LoginType.NAVER,
    },
    {
      name: '이메일로 시작하기',
      id: 'email-login-button',
      icon: <SvgEmail />,
      style: 'hover:bg-[#E4E7EC] border-[1px] border-[#E4E7EC] text-gray-900',
      action: handleEmailLogin,
      type: LoginType.EMAIL,
    },
  ];

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
            {LOGIN_BUTTONS.map((button) => {
              const isLoadingButton = loadingButton === button.type;
              const isLoading = isLoadingButton ? isKakaoLoading || isNaverLoading : false;
              return (
                <button
                  key={button.id}
                  id={button.id}
                  onClick={button.action}
                  disabled={isLoading}
                  className={cn(
                    'flex h-[48px] w-[280px] items-center justify-center gap-2 rounded-[230px] font-semibold transition-colors',
                    button.style,
                    isLoading && 'cursor-not-allowed opacity-70',
                  )}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="size-5" />
                      로딩 중...
                    </>
                  ) : (
                    <>
                      {button.icon}
                      {button.name}
                    </>
                  )}
                </button>
              );
            })}
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
