export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enable';
export const IS_PRD = process.env.NODE_ENV === 'production';
export const IS_STAGING = process.env.NODE_ENV === 'test';
export const NEXT_PUBLIC_SERVICE_URL = process.env.NEXT_PUBLIC_SERVICE_URL;
export const NEXT_PUBLIC_DEFAULT_SERVICE_URL = 'https://jirum-alarm.com';
export const METADATA_SERVICE_URL = NEXT_PUBLIC_SERVICE_URL ?? NEXT_PUBLIC_DEFAULT_SERVICE_URL;
export const API_URL = process.env.API_URL;
export const LANDING_URL = process.env.LANDING_URL ?? 'https://about-us.jirum-alarm.com';

export const KAKAO_SECRET = process.env.NEXT_PUBLIC_KAKAO_SECRET ?? '';

export const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI ?? '';

export const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? '';
export const NAVER_CLIENT_SECRET = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET ?? '';
