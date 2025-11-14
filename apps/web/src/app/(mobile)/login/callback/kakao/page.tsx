'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import LoadingSpinner from '@/components/common/icons/LoadingSpinner';
import BasicLayout from '@/components/layout/BasicLayout';
import { PAGE } from '@/constants/page';
import { AuthService } from '@/shared/api/auth';
import { OauthProvider } from '@/shared/api/gql/graphql';

const KakaoCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const { mutate: socialLogin } = useMutation({
    mutationFn: AuthService.socialLogin,
    onSuccess: (data) => {
      console.log('카카오 로그인 성공:', data);
      router.push(PAGE.HOME);
    },
    onError: (error) => {
      console.error('카카오 로그인 실패:', error);
      router.push(PAGE.LOGIN);
    },
  });

  useEffect(() => {
    if (error) {
      console.error('카카오 로그인 에러:', error);
      router.push(PAGE.LOGIN);
      return;
    }

    if (!code) {
      console.error('Authorization code가 없습니다.');
      router.push(PAGE.LOGIN);
      return;
    }

    socialLogin({
      oauthProvider: OauthProvider.Kakao,
      socialAccessToken: code,
    });
  }, [code, error, socialLogin, router]);

  return (
    <BasicLayout fullScreen>
      <div className="flex h-full flex-col items-center justify-center">
        <LoadingSpinner className="mb-4 size-12" />
        <p className="text-lg font-semibold text-gray-700">카카오 로그인 처리 중...</p>
      </div>
    </BasicLayout>
  );
};

export default KakaoCallback;
