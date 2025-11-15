import { useState } from 'react';

import { NAVER_CLIENT_ID } from '@/constants/env';
import { WindowLocation } from '@/shared/lib/window-location';

export const useNaverLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithNaver = (): Promise<void> => {
    return new Promise((resolve) => {
      const STATE = Math.random().toString(36).substring(2, 15);
      const REDIRECT_URI = encodeURIComponent(
        WindowLocation.getCurrentOrigin() + '/login/callback/naver',
      );
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;
      window.location.href = naverAuthUrl;
      resolve();
    });
  };

  const executeNaverLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await loginWithNaver();
    } catch (error) {
      console.error('네이버 로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeNaverLogin,
    isLoading,
  };
};
