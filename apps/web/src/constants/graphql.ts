import { IS_API_MOCKING, IS_PRD, SERVICE_URL } from './env';

export const GRAPHQL_ENDPOINT_PROXY = IS_PRD
  ? SERVICE_URL + '/api/graphql'
  : 'http://localhost:3000/api/graphql';

export const GRAPHQL_ENDPOINT = IS_API_MOCKING
  ? 'http://localhost:9090/graphql'
  : process.env.NEXT_PUBLIC_API_URL || 'https://jirum-dev-api.kyojs.com/graphql';
export const GRAPHQL_SUBSCRIPTIONS_ENDPOINT =
  process.env.SUBSCRIPTIONS_GRAPHQL_ENDPOINT || 'wss://jirum-dev-api.kyojs.com/graphql';
