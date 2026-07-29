import { useState } from 'react';

import { ensureKakao } from '@/shared/lib/kakao';
import { WindowLocation } from '@/shared/lib/window-location';

export const useKakaoLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithKakao = (rtnUrl?: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.Kakao || !window.Kakao.isInitialized()) {
        throw new Error('Kakao SDK가 초기화되지 않았습니다.');
      }

      const stateData = {
        random: Math.random().toString(36).substring(2, 15),
        rtnUrl: rtnUrl || '',
      };
      const STATE = btoa(JSON.stringify(stateData));

      window.Kakao.Auth.authorize({
        redirectUri: `${WindowLocation.getCurrentOrigin()}/login/callback/kakao`,
        state: STATE,
      });

      resolve();
    });
  };

  const executeKakaoLogin = async (rtnUrl?: string): Promise<void> => {
    try {
      setIsLoading(true);
      await ensureKakao();
      await loginWithKakao(rtnUrl);
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    executeKakaoLogin,
    isLoading,
  };
};
