// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { isCrawlerUA } from '@/shared/config/user-agent';
import {
  createBurstLimiter,
  createTransactionFilter,
  SENTRY_DENY_URLS,
  SENTRY_ERROR_SAMPLE_RATE,
  SENTRY_IGNORE_ERRORS,
} from '@/shared/lib/sentry-filter';

// development 환경(NODE_ENV=test)에서는 센트리 비활성화
const isDevelopment = process.env.NODE_ENV !== 'production';

Sentry.init({
  dsn: 'https://fa4f9f87feed1eefd14d9c786019044c@o4506348721864704.ingest.us.sentry.io/4506919541669888',

  // development 환경에서는 센트리 비활성화
  enabled: !isDevelopment,

  // Replay 는 넣지 않는다 — 번들 143KB(gz) 청크의 대부분이었고, 세션 리플레이는 Clarity 가 이미 한다.
  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,
  // Enable logs to be sent to Sentry
  enableLogs: false,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  // 소음·폭주 거르기 — 이유는 sentry-filter.ts.
  sampleRate: SENTRY_ERROR_SAMPLE_RATE,
  ignoreErrors: SENTRY_IGNORE_ERRORS,
  denyUrls: SENTRY_DENY_URLS,
  beforeSend: createBurstLimiter(),
  beforeSendTransaction: createTransactionFilter(isCrawlerUA),

  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
