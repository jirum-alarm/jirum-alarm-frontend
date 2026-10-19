import { API_URL, IS_PRD, NEXT_PUBLIC_SERVICE_URL } from './env';

// 배포된 파드(운영·스테이징)인가 = 클러스터 안 API_URL 로 바로 붙는가. 두 배포 모두 `next build`/`next start` 라
// NODE_ENV 가 production 으로 고정된다. 예전엔 `|| NODE_ENV === 'test'` (이름 IS_STAGING)가 있었지만
// 그 값은 jest 에서만 참이라 스테이징과 무관했다 — 로컬 `next dev` 만 dev API·GRAPHQL_ENDPOINT 를 쓴다.
const IS_DEPLOYED_BUILD = IS_PRD;

// 로컬 개발은 dev API 가 기본이지만, GRAPHQL_ENDPOINT 를 주면 그걸 쓴다.
// (dev API 가 죽었거나 운영에만 배포된 스키마를 로컬에서 확인해야 할 때 필요)
export const GRAPHQL_ENDPOINT = IS_DEPLOYED_BUILD
  ? `${API_URL}/graphql`
  : (process.env.GRAPHQL_ENDPOINT ?? 'https://jirum-dev-api.kyojs.com/graphql');

// 브라우저는 항상 같은 origin 의 /api/graphql 로.
// localhost:3000 고정이면 (포트가 3001로 떠도) 다른 next 프로세스로 가서 쿼리가 깨지고
// priceHistory 같은 client-only 섹션이 조용히 사라진다.
export const GRAPHQL_ENDPOINT_PROXY = IS_DEPLOYED_BUILD
  ? `${NEXT_PUBLIC_SERVICE_URL}/api/graphql`
  : '/api/graphql';

export const GRAPHQL_SUBSCRIPTIONS_ENDPOINT =
  process.env.SUBSCRIPTIONS_GRAPHQL_ENDPOINT || 'wss://jirum-dev-api.kyojs.com/graphql';
