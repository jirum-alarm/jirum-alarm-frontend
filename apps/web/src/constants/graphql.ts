import { API_URL, IS_PRD, IS_STAGING, NEXT_PUBLIC_SERVICE_URL } from './env';

const IS_INTERNAL_NETWORK = IS_PRD || IS_STAGING;

export const GRAPHQL_ENDPOINT = IS_INTERNAL_NETWORK
  ? `${API_URL}/graphql`
  : 'https://jirum-dev-api.kyojs.com/graphql';

export const GRAPHQL_ENDPOINT_PROXY = IS_INTERNAL_NETWORK
  ? `${NEXT_PUBLIC_SERVICE_URL}/api/graphql`
  : 'https://localhost:3000/api/graphql';

export const GRAPHQL_SUBSCRIPTIONS_ENDPOINT =
  process.env.SUBSCRIPTIONS_GRAPHQL_ENDPOINT || 'wss://jirum-dev-api.kyojs.com/graphql';
