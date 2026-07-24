import { API_URL, IS_PRD, IS_STAGING, NEXT_PUBLIC_SERVICE_URL } from './env';

const IS_INTERNAL_NETWORK = IS_PRD || IS_STAGING;

export const GRAPHQL_ENDPOINT = IS_INTERNAL_NETWORK
  ? `${API_URL}/graphql`
  : 'https://jirum-dev-api.kyojs.com/graphql';

// 브라우저는 항상 같은 origin 의 /api/graphql 로.
// localhost:3000 고정이면 (포트가 3001로 떠도) 다른 next 프로세스로 가서 쿼리가 깨지고
// priceHistory 같은 client-only 섹션이 조용히 사라진다.
export const GRAPHQL_ENDPOINT_PROXY = IS_INTERNAL_NETWORK
  ? `${NEXT_PUBLIC_SERVICE_URL}/api/graphql`
  : '/api/graphql';

export const GRAPHQL_SUBSCRIPTIONS_ENDPOINT =
  process.env.SUBSCRIPTIONS_GRAPHQL_ENDPOINT || 'wss://jirum-dev-api.kyojs.com/graphql';
