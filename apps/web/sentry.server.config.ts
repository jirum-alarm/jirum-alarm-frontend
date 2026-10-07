// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

import { tempoSpanProcessors, enableW3CTracePropagation } from './otel-tempo';

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

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  // 같은 span 을 사내 Tempo 로도(OTEL_EXPORTER_OTLP_ENDPOINT 있을 때만). 자세한 건 otel-tempo.ts.
  openTelemetrySpanProcessors: tempoSpanProcessors(),
});

enableW3CTracePropagation();
