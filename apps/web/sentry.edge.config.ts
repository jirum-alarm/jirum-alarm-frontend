// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { isCrawlerUA } from './src/shared/config/user-agent';
import {
  createBurstLimiter,
  createTransactionFilter,
  SENTRY_DENY_URLS,
  SENTRY_ERROR_SAMPLE_RATE,
  SENTRY_IGNORE_ERRORS,
} from './src/shared/lib/sentry-filter';

// development 환경(NODE_ENV=test)에서는 센트리 비활성화
const isDevelopment = process.env.NODE_ENV === 'test';

Sentry.init({
  dsn: 'https://fa4f9f87feed1eefd14d9c786019044c@o4506348721864704.ingest.us.sentry.io/4506919541669888',

  // development 환경에서는 센트리 비활성화
  enabled: !isDevelopment,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  // 1 이면 봇 포함 모든 요청을 트레이싱해 조직 span 할당량이 바닥났고(2026-10-08 /monitoring 429
  // span_usage_exceeded), 클라이언트 트랜잭션까지 버려졌다. 에러 수집과는 무관. 클라이언트(0.1)와 맞춘다.
  tracesSampleRate: 0.1,

  // 로그는 끈다 — 하루 수백만 건이 할당량 밖이라 전부 버려지면서 직렬화 비용만 들었다(2026-10-16 stats_v2 client_discard).
  enableLogs: false,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  // 소음·폭주 거르기 — 이유는 sentry-filter.ts.
  sampleRate: SENTRY_ERROR_SAMPLE_RATE,
  ignoreErrors: SENTRY_IGNORE_ERRORS,
  denyUrls: SENTRY_DENY_URLS,
  beforeSend: createBurstLimiter(),
  beforeSendTransaction: createTransactionFilter(isCrawlerUA),

  sendDefaultPii: true,
});
