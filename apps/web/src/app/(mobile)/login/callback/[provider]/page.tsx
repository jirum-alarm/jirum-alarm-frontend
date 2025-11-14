'use client';

import { useMutation } from '@tanstack/react-query';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import LoadingSpinner from '@/components/common/icons/LoadingSpinner';
import BasicLayout from '@/components/layout/BasicLayout';
import { PAGE } from '@/constants/page';
import { AuthService } from '@/shared/api/auth';
import { OauthProvider } from '@/shared/api/gql/graphql';

const PROVIDER_MAP: Record<string, OauthProvider> = {
  kakao: OauthProvider.Kakao,
  naver: OauthProvider.Naver,
};

const PROVIDER_NAMES: Record<string, string> = {
  kakao: '카카오',
  naver: '네이버',
};

const isInvalidProvider = (provider: string) => {
  return !Object.keys(PROVIDER_MAP).includes(provider);
};

const SocialLoginCallbackPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const provider = params.provider as string;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (isInvalidProvider(provider)) {
    notFound();
  }

  const oauthProvider = PROVIDER_MAP[provider];
  const providerName = PROVIDER_NAMES[provider] || provider;

  const { mutate: socialLogin } = useMutation({
    mutationFn: AuthService.socialLogin,
    onSuccess: (data) => {
      console.log(`${providerName} 로그인 성공:`, data);
      // TODO: 토큰 저장 및 페이지 이동
      router.push(PAGE.HOME);
    },
    onError: (error) => {
      console.error(`${providerName} 로그인 실패:`, error);
      router.push(PAGE.LOGIN);
    },
  });

  useEffect(() => {
    if (error) {
      console.error(`${providerName} 로그인 에러:`, error);
      router.push(PAGE.LOGIN);
      return;
    }

    if (!code) {
      console.error('Authorization code가 없습니다.');
      router.push(PAGE.LOGIN);
      return;
    }

    AuthService.socialAccessToken({
      code,
      oauthProvider,
      state: searchParams.get('state') || '',
    })
      .then((res) =>
        socialLogin({
          oauthProvider,
          socialAccessToken: res.socialAccessToken,
        }),
      )
      .catch((error) => {
        console.error('socialAccessToken 조회 실패:', error);
        router.push(PAGE.LOGIN);
      });
  }, [code, error, oauthProvider, providerName, socialLogin, router]);

  return (
    <BasicLayout fullScreen>
      <div className="flex h-full flex-col items-center justify-center">
        <LoadingSpinner className="mb-4 size-12" />
        <p className="text-lg font-semibold text-gray-700">{providerName} 로그인 처리 중...</p>
      </div>
    </BasicLayout>
  );
};

export default SocialLoginCallbackPage;
