import { env } from 'next-runtime-env';
import { useState } from 'react';

import { WindowLocation } from '@/shared/lib/window-location';

export const useNaverLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithNaver = (rtnUrl?: string): Promise<void> => {
    return new Promise((resolve) => {
      const stateData = {
        random: Math.random().toString(36).substring(2, 15),
        rtnUrl: rtnUrl || '',
      };
      const STATE = btoa(JSON.stringify(stateData));
      const REDIRECT_URI = encodeURIComponent(
        WindowLocation.getCurrentOrigin() + '/login/callback/naver',
      );
      const naverClientId = env('NEXT_PUBLIC_NAVER_CLIENT_ID') ?? '';
      const naverAuthUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${naverClientId}&redirect_uri=${REDIRECT_URI}&state=${STATE}`;
      window.location.href = naverAuthUrl;
      resolve();
    });
  };

  const executeNaverLogin = async (rtnUrl?: string): Promise<void> => {
    try {
      setIsLoading(true);
      await loginWithNaver(rtnUrl);
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
