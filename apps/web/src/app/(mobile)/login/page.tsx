'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { cn } from '@/shared/lib/cn';
import { StandingIllust } from '@/shared/ui/icons/Illust';
import LoadingSpinner from '@/shared/ui/icons/LoadingSpinner';
import SvgEmail from '@/shared/ui/icons/login/Email';
import SvgKakao from '@/shared/ui/icons/login/Kakao';
import SvgNaver from '@/shared/ui/icons/login/Naver';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import AppDownloadBanner from '@/features/app-download/ui/AppDownloadBanner';
import { useKakaoLogin } from '@/features/auth/lib/use-kakao-login';
import { useNaverLogin } from '@/features/auth/lib/use-naver-login';

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
  const searchParams = useSearchParams();
  const rtnUrl = searchParams.get('rtnUrl') || undefined;
  const { executeKakaoLogin, isLoading: isKakaoLoading } = useKakaoLogin();
  const { executeNaverLogin, isLoading: isNaverLoading } = useNaverLogin();
  const [loadingButton, setLoadingButton] = useState<LoginType | null>(null);

  const handleKakaoLogin = async () => {
    try {
      setLoadingButton(LoginType.KAKAO);
      await executeKakaoLogin(rtnUrl);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
    } finally {
      setLoadingButton(null);
    }
  };

  const handleNaverLogin = async () => {
    try {
      setLoadingButton(LoginType.NAVER);
      await executeNaverLogin(rtnUrl);
    } catch (error) {
      console.error('네이버 로그인 실패:', error);
    } finally {
      setLoadingButton(null);
    }
  };

  const handleEmailLogin = () => {
    const emailLoginUrl = rtnUrl
      ? `${PAGE.LOGIN_BY_EMAIL}?rtnUrl=${encodeURIComponent(rtnUrl)}`
      : PAGE.LOGIN_BY_EMAIL;
    router.push(emailLoginUrl);
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

            {/* Email Signup Link */}
            <Link
              href={PAGE.SIGNUP}
              className="mt-2 text-sm text-gray-600 underline transition-colors hover:text-gray-900"
            >
              이메일로 가입하기
            </Link>
          </div>
        </div>

        {device.isMobileBrowser && isHydrated && (
          <div className="bottom-safe-bottom fixed right-0 left-0 m-auto flex w-full max-w-[600px] flex-col justify-between bg-white">
            <AppDownloadBanner device={device} />
          </div>
        )}
      </div>
    </BasicLayout>
  );
};

export default Login;
