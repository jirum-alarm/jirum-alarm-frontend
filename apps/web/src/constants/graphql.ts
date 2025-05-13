import { IS_API_MOCKING, IS_PRD } from './env';

export const GRAPHQL_ENDPOINT = IS_API_MOCKING
  ? 'http://localhost:9090/graphql'
  : (process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ??
    (IS_PRD
      ? 'http://crawling-server-lb.crawling-server.svc.cluster.local:3100'
      : 'http://crawling-server-lb.crawling-server-dev.svc.cluster.local:3100'));
export const GRAPHQL_SUBSCRIPTIONS_ENDPOINT =
  process.env.SUBSCRIPTIONS_GRAPHQL_ENDPOINT || 'wss://jirum-dev-api.kyojs.com/graphql';
