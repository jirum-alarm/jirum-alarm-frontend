'use client';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { WindowLocation } from '@/shared/lib/window-location';
import AlertDialog from '@/shared/ui/common/AlertDialog';
import LoadingSpinner from '@/shared/ui/common/icons/LoadingSpinner';
import SvgEmail from '@/shared/ui/common/icons/login/Email';
import SvgKakao from '@/shared/ui/common/icons/login/Kakao';
import SvgNaver from '@/shared/ui/common/icons/login/Naver';

import { useKakaoLogin } from '../../lib/use-kakao-login';
import { useNaverLogin } from '../../lib/use-naver-login';
import { loginModalMessageAtom } from '../../model/login/loginModal';
import { getRecentLoginMethod, LoginMethod } from '../../model/login/recentLoginMethod';

const LOGIN_BUTTON_STYLE: Record<LoginMethod, string> = {
  kakao: 'bg-[#FBE84C] hover:bg-[#F5DC3D] text-gray-900',
  naver: 'bg-[#02C75A] hover:bg-[#00B04F] text-white',
  email: 'hover:bg-[#E4E7EC] border-[1px] border-[#E4E7EC] text-gray-900',
};

const RECENT_METHOD_LABEL: Record<LoginMethod, string> = {
  kakao: '카카오',
  naver: '네이버',
  email: '이메일',
};

/**
 * 로그인 필요 액션(찜/알림 등)을 페이지 이동 없이 즉시 유도하는 모달.
 * OAuth(카카오/네이버) 자체는 여전히 전체 페이지 리다이렉트 — 팝업 전환은 하지 않는다.
 * 리다이렉트 전 rtnUrl 로 현재 위치를 넘겨 로그인 완료 후 그대로 복귀한다.
 */
export default function LoginModal() {
  const [message, setMessage] = useAtom(loginModalMessageAtom);
  const [recentMethod, setRecentMethod] = useState<LoginMethod | null>(null);
  const [loadingMethod, setLoadingMethod] = useState<LoginMethod | null>(null);
  const { executeKakaoLogin } = useKakaoLogin();
  const { executeNaverLogin } = useNaverLogin();

  useEffect(() => {
    if (message !== null) setRecentMethod(getRecentLoginMethod());
  }, [message]);

  if (message === null) return null;

  const rtnUrl = WindowLocation.getCurrentUrl();

  const handleKakaoLogin = async () => {
    setLoadingMethod('kakao');
    try {
      await executeKakaoLogin(rtnUrl);
    } finally {
      setLoadingMethod(null);
    }
  };

  const handleNaverLogin = async () => {
    setLoadingMethod('naver');
    try {
      await executeNaverLogin(rtnUrl);
    } finally {
      setLoadingMethod(null);
    }
  };

  const handleEmailLogin = () => {
    window.location.href = `/login/email?rtnUrl=${encodeURIComponent(rtnUrl)}`;
  };

  return (
    <AlertDialog defaultOpen onOpenChange={(open) => !open && setMessage(null)}>
      <AlertDialog.Content className="max-w-[320px] gap-5">
        <AlertDialog.Header className="gap-1.5">
          <AlertDialog.Title className="text-lg font-semibold text-gray-900">
            {message.title}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-sm text-gray-500">
            {message.description}
          </AlertDialog.Description>
          {recentMethod && (
            <p className="text-xs text-gray-400">
              최근에 {RECENT_METHOD_LABEL[recentMethod]}으로 로그인했어요
            </p>
          )}
        </AlertDialog.Header>
        <div className="flex flex-col gap-2">
          <LoginOptionButton
            icon={<SvgKakao />}
            label="카카오로 시작하기"
            method="kakao"
            isLoading={loadingMethod === 'kakao'}
            disabled={loadingMethod !== null}
            onClick={handleKakaoLogin}
          />
          <LoginOptionButton
            icon={<SvgNaver />}
            label="네이버로 시작하기"
            method="naver"
            isLoading={loadingMethod === 'naver'}
            disabled={loadingMethod !== null}
            onClick={handleNaverLogin}
          />
          <LoginOptionButton
            icon={<SvgEmail />}
            label="이메일로 시작하기"
            method="email"
            isLoading={false}
            disabled={loadingMethod !== null}
            onClick={handleEmailLogin}
          />
        </div>
        <AlertDialog.Cancel asChild>
          <button type="button" className="h-10 text-sm text-gray-500">
            다음에 할게요
          </button>
        </AlertDialog.Cancel>
      </AlertDialog.Content>
    </AlertDialog>
  );
}

function LoginOptionButton({
  method,
  icon,
  label,
  isLoading,
  disabled,
  onClick,
}: {
  method: LoginMethod;
  icon: React.ReactNode;
  label: string;
  isLoading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 w-full items-center justify-center gap-2 rounded-[230px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 ${LOGIN_BUTTON_STYLE[method]}`}
    >
      {isLoading ? (
        <LoadingSpinner className="size-5" />
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </button>
  );
}
