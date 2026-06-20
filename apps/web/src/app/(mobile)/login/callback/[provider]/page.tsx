'use client';

import { useMutation } from '@tanstack/react-query';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { setAccessToken, setRefreshToken } from '@/app/actions/token';

import { AuthService } from '@/shared/api/auth';
import { OauthProvider } from '@/shared/api/gql/graphql';
import { PAGE } from '@/shared/config/page';
import useMyRouter from '@/shared/hooks/useMyRouter';
import LoadingSpinner from '@/shared/ui/common/icons/LoadingSpinner';
import { useToast } from '@/shared/ui/common/Toast';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

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
  const router = useMyRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const provider = params.provider as string;
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (isInvalidProvider(provider)) {
    notFound();
  }

  const oauthProvider = PROVIDER_MAP[provider];
  const providerName = PROVIDER_NAMES[provider] || provider;

  const extractRtnUrlFromState = (state: string | null): string | null => {
    if (!state) return null;
    try {
      const stateData = JSON.parse(atob(state));
      return stateData.rtnUrl || null;
    } catch {
      return null;
    }
  };

  const { mutate: socialLogin } = useMutation({
    mutationFn: AuthService.socialLogin,
    onSuccess: async (data) => {
      await setAccessToken(data.socialLogin.accessToken);
      if (data.socialLogin.refreshToken) {
        await setRefreshToken(data.socialLogin.refreshToken);
      }

      const rtnUrl = extractRtnUrlFromState(state);
      const landing = rtnUrl && rtnUrl !== '' ? decodeURIComponent(rtnUrl) : PAGE.HOME;

      // 신규 OAuth 가입은 /signup/complete 를 거쳐 보낸다. 이메일 가입과 동일한 GTM URL 트리거가
      // 발화돼야 signup_complete 가 잡힌다(계측은 코드가 아닌 GTM DOM 트리거가 함). type 은
      // 서버 social.service 가 신규=SIGNUP / 기존=LOGIN 으로 내려준다.
      if (data.socialLogin.type === 'SIGNUP') {
        toast('회원가입에 성공했어요.');
        router.replace(`${PAGE.SIGNUP_COMPLETE}?rtnUrl=${encodeURIComponent(landing)}`);
        return;
      }

      toast('로그인에 성공했어요.');
      router.replace(landing);
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
      state: state || '',
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
  }, [code, error, oauthProvider, providerName, socialLogin, router, state]);

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
