import { env } from 'next-runtime-env';

/**
 * 런타임 env(서버에서만 읽는다). 이미지를 다시 굽지 않고 gitops 값만 바꿔 prod/staging 을 가른다.
 *
 * ⚠️ `process.env.NEXT_PUBLIC_*` 를 그대로 쓰면 Next 가 **빌드 시점 값으로 박는다**(서버 코드도) — 이 앱은
 * apps/ai 처럼 이미지 안에서 env 없이 빌드하므로 빈 값이 박힌다. 그래서 next-runtime-env 의 env() 로 읽는다.
 * ⚠️ 빈 문자열은 `??` 를 통과한다 — 기본값은 truthy 검사로(apps/ai fetchDeals 의 2026-08-07 운영 함정).
 */
export const DEFAULT_SERVICE_URL = 'https://jirum-alarm.com';

/** 이 배포의 바깥 주소(canonical·JSON-LD·OG). web 과 같은 이름·같은 값. */
export const serviceUrl = () => env('NEXT_PUBLIC_SERVICE_URL')?.trim() || DEFAULT_SERVICE_URL;

/** 운영(apex)만 색인 허용 — web shared/config/env.ts IS_INDEXABLE_DEPLOYMENT 와 같은 판정(미설정이면 apex 로 폴백). */
export const isIndexableDeployment = () => serviceUrl() === DEFAULT_SERVICE_URL;

/** 뷰티 카톡방 링크. 비어 있으면 입장 안내를 그리지 않는다(코드 기본값 없음 — gitops configmap 에만). */
export const kakaoBeautyRoomUrl = () => env('NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL')?.trim() ?? '';

/**
 * 서버 렌더가 부를 GraphQL. 클러스터에선 web 과 같은 `API_URL`(crawling-service-lb, 내부 직통)에 /graphql.
 * 로컬은 `GRAPHQL_ENDPOINT`(.env.local), 둘 다 없으면 운영 공개 주소.
 */
export const graphqlEndpoint = () => {
  const apiUrl = process.env.API_URL?.trim();
  if (apiUrl) return `${apiUrl.replace(/\/$/, '')}/graphql`;
  return process.env.GRAPHQL_ENDPOINT?.trim() || `${DEFAULT_SERVICE_URL}/api/graphql`;
};
