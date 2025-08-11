import { API_URL, IS_PRD, IS_STAGING, SERVICE_URL } from './env';

const IS_INTERNAL_NETWORK = IS_PRD || IS_STAGING;

if (IS_INTERNAL_NETWORK) {
  if (!API_URL) {
    throw new Error('API_URL is not set');
  }
  if (!SERVICE_URL) {
    throw new Error('SERVICE_URL is not set');
  }
}

export const GRAPHQL_ENDPOINT = IS_INTERNAL_NETWORK
  ? `${API_URL}/graphql`
  : 'https://jirum-dev-api.kyojs.com/graphql';

export const GRAPHQL_ENDPOINT_PROXY = IS_INTERNAL_NETWORK
  ? `${SERVICE_URL}/api/graphql`
  : 'http://localhost:3000/api/graphql';

export const GRAPHQL_SUBSCRIPTIONS_ENDPOINT =
  process.env.SUBSCRIPTIONS_GRAPHQL_ENDPOINT || 'wss://jirum-dev-api.kyojs.com/graphql';
