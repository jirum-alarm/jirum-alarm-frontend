import { env } from 'next-runtime-env';
import { useEffect, useRef, useState } from 'react';

import { WindowLocation } from '@/shared/lib/window-location';

declare global {
  interface Window {
    Kakao: any;
  }
}

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.7/kakao.min.js';
const KAKAO_SDK_INTEGRITY =
  'sha384-tJkjbtDbvoxO+diRuDtwRO9JXR7pjWnfjfRn5ePUpl7e7RJCxKCwwnfqUAdXh53p';

export const useKakaoLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const loadKakaoSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.Kakao && window.Kakao.isInitialized()) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(`script[src="${KAKAO_SDK_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          resolve();
        });
        return;
      }

      const script = document.createElement('script');
      script.src = KAKAO_SDK_URL;
      script.integrity = KAKAO_SDK_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.async = true;

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(new Error('카카오 로그인 SDK 로드 실패'));
      };

      scriptRef.current = script;
      document.body.appendChild(script);
    });
  };

  const initKakaoSDK = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.Kakao) {
        throw new Error('Kakao SDK가 로드되지 않았습니다.');
      }

      if (!window.Kakao.isInitialized()) {
        const kakaoSecret = env('NEXT_PUBLIC_KAKAO_SECRET') ?? '';
        window.Kakao.init(kakaoSecret);
      }
      resolve();
    });
  };

  const loginWithKakao = (): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.Kakao || !window.Kakao.isInitialized()) {
        throw new Error('Kakao SDK가 초기화되지 않았습니다.');
      }

      const STATE = Math.random().toString(36).substring(2, 15);

      window.Kakao.Auth.authorize({
        redirectUri: `${WindowLocation.getCurrentOrigin()}/login/callback/kakao`,
        state: STATE,
      });

      resolve();
    });
  };

  const executeKakaoLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await loadKakaoSDK();
      await initKakaoSDK();
      await loginWithKakao();
    } catch (error) {
      console.error('카카오 로그인 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  return {
    executeKakaoLogin,
    isLoading,
  };
};
