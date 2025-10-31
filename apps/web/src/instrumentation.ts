import * as Sentry from '@sentry/nextjs';

// development 환경(NODE_ENV=test)에서는 센트리 비활성화
const isDevelopment = process.env.NODE_ENV !== 'production';

export async function register() {
  // development 환경에서는 센트리 초기화를 건너뜀
  if (isDevelopment) {
    return;
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
