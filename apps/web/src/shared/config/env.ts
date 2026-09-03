export const IS_API_MOCKING = process.env.NEXT_PUBLIC_API_MOCKING === 'enable';
export const IS_PRD = process.env.NODE_ENV === 'production';
export const IS_STAGING = process.env.NODE_ENV === 'test';
export const NEXT_PUBLIC_SERVICE_URL = process.env.NEXT_PUBLIC_SERVICE_URL;
export const NEXT_PUBLIC_DEFAULT_SERVICE_URL = 'https://jirum-alarm.com';
export const METADATA_SERVICE_URL = NEXT_PUBLIC_SERVICE_URL ?? NEXT_PUBLIC_DEFAULT_SERVICE_URL;

/**
 * 이 배포가 색인돼도 되는 곳인가. 운영(apex)만 true.
 *
 * dev 배포가 `index, follow` + 자기 canonical 로 떠 있어서 GPTBot·bingbot 이 dev 를 긁어가
 * Bing 인덱스와 학습 코퍼스에 중복 도메인이 들어갔다(2026-09-03 실측: `site:jirum-alarm.com`
 * Bing 결과 3·4위가 dev 상품 URL, 75분 로그에서 GPTBot 853건 중 852건이 dev 호스트).
 *
 * 값 기준을 `METADATA_SERVICE_URL` 로 잡은 이유 = 미설정이면 apex 로 폴백하므로 **fail-safe
 * 방향이 "색인 허용"**. 호스트 화이트리스트 방식은 목록이 틀리면 운영이 통째로 noindex 가 된다.
 */
export const IS_INDEXABLE_DEPLOYMENT = METADATA_SERVICE_URL === NEXT_PUBLIC_DEFAULT_SERVICE_URL;
export const API_URL = process.env.API_URL;
export const LANDING_URL = process.env.LANDING_URL ?? 'https://about-us.jirum-alarm.com';

export const KAKAO_SECRET = process.env.NEXT_PUBLIC_KAKAO_SECRET ?? '';

export const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI ?? '';

export const NAVER_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID ?? '';
export const NAVER_CLIENT_SECRET = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET ?? '';
