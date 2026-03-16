import {useMutation, useQueryClient} from '@tanstack/react-query';
import {login} from '@react-native-seoul/kakao-login';
import NaverLogin from '@react-native-seoul/naver-login';
import * as AppleAuthentication from 'expo-apple-authentication';
import {useEffect, useState} from 'react';
import {AuthQueries} from '@/entities/auth';
import {AuthService} from '@/shared/api/auth/auth.service';
import {OauthProvider} from '@/shared/api/gql/graphql';
import {showToast} from '@/shared/lib/feedback';
import {handleLoginError, handleLoginSuccess} from './lib';

const NAVER_CLIENT_ID = 'ipyjWS3C8WLZGkmCzoXd';
const NAVER_CLIENT_SECRET = 'uYNNDDEcAd';
const NAVER_LOGIN_URL_SCHEME = 'jirumalarmnaver';
const APP_NAME = '지름알림';

export const useSocialLogin = () => {
  const [isAppleLoginAvailable, setIsAppleLoginAvailable] = useState(false);
  const queryClient = useQueryClient();
  const {mutate: socialLoginMutate, isPending: isSocialLoginPending} =
    useMutation({
      mutationFn: AuthService.socialLogin,
      onSuccess: async token => {
        await handleLoginSuccess(
          token.socialLogin.accessToken,
          token.socialLogin.refreshToken,
        );
        await queryClient.refetchQueries({
          queryKey: AuthQueries.keys.loginByRefreshToken(),
        });
      },
      onError: async () => {
        await handleLoginError('로그인에 실패했습니다. 다시 시도해주세요.');
      },
    });

  // 네이버 SDK 초기화
  useEffect(() => {
    NaverLogin.initialize({
      appName: APP_NAME,
      consumerKey: NAVER_CLIENT_ID,
      consumerSecret: NAVER_CLIENT_SECRET,
      serviceUrlSchemeIOS: NAVER_LOGIN_URL_SCHEME,
      disableNaverAppAuthIOS: true,
    });

    AppleAuthentication.isAvailableAsync()
      .then(setIsAppleLoginAvailable)
      .catch(() => setIsAppleLoginAvailable(false));
  }, []);

  const signInWithKakao = async () => {
    try {
      const token = await login();
      console.log('Kakao Token:', token);
      socialLoginMutate({
        oauthProvider: OauthProvider.Kakao,
        socialAccessToken: token.accessToken,
      });
    } catch (err) {
      console.error('Kakao login error:', err);
      showToast.info('카카오 로그인에 실패했습니다.');
    }
  };

  const signInWithNaver = async () => {
    try {
      const {successResponse, failureResponse} = await NaverLogin.login();
      if (successResponse) {
        socialLoginMutate({
          oauthProvider: OauthProvider.Naver,
          socialAccessToken: successResponse.accessToken,
        });
      } else {
        // 네이버 로그인 실패 또는 취소
        console.error('Naver login failure:', failureResponse);
        if (failureResponse?.isCancel) {
          // 사용자가 로그인을 취소한 경우
          showToast.info('네이버 로그인이 취소되었습니다.');
        } else {
          showToast.info('네이버 로그인에 실패했습니다.');
        }
      }
    } catch (err) {
      console.error('Naver login error:', err);
      showToast.info('네이버 로그인 중 오류가 발생했습니다.');
    }
  };

  const signInWithApple = async () => {
    try {
      if (!isAppleLoginAvailable) {
        showToast.info('Apple 로그인은 iOS 13 이상 기기에서만 지원됩니다.');
        return;
      }
      const appleAuthRequestResponse = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const {identityToken} = appleAuthRequestResponse;

      if (!identityToken) {
        showToast.info('Apple 로그인 정보를 가져오는데 실패했습니다.');
        return;
      }

      socialLoginMutate({
        oauthProvider: OauthProvider.Apple,
        socialAccessToken: identityToken,
      });
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : null;

      if (errorCode === 'ERR_REQUEST_CANCELED') {
        showToast.info('Apple 로그인이 취소되었습니다.');
        return;
      }
      console.error('Apple login error:', error);
      showToast.info('Apple 로그인 중 오류가 발생했습니다.');
    }
  };

  return {
    signInWithKakao,
    signInWithNaver,
    signInWithApple,
    isAppleLoginAvailable,
    isSocialLoginPending,
  };
};
