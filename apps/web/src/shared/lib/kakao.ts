import { env } from 'next-runtime-env';

declare global {
  interface Window {
    Kakao: any;
  }
}

const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.7/kakao.min.js';
const KAKAO_SDK_INTEGRITY =
  'sha384-tJkjbtDbvoxO+diRuDtwRO9JXR7pjWnfjfRn5ePUpl7e7RJCxKCwwnfqUAdXh53p';

// 로그인·공유가 같은 SDK 를 공유한다. script 태그는 한 번 붙이면 제거하지 않는다 —
// 한쪽이 언마운트될 때 태그를 떼면 다른 쪽이 깨진다.
let loadPromise: Promise<void> | null = null;

export const loadKakaoSDK = (): Promise<void> => {
  if (window.Kakao) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${KAKAO_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('카카오 SDK 로드 실패')));
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.integrity = KAKAO_SDK_INTEGRITY;
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null; // 재시도 가능하게
      reject(new Error('카카오 SDK 로드 실패'));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
};

export const initKakao = (): void => {
  if (!window.Kakao) throw new Error('Kakao SDK가 로드되지 않았습니다.');
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(env('NEXT_PUBLIC_KAKAO_SECRET') ?? '');
  }
};

/** SDK 로드 + 초기화까지. 실패 시 throw. */
export const ensureKakao = async (): Promise<void> => {
  await loadKakaoSDK();
  initKakao();
};
