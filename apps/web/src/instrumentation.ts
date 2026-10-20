import { trace } from '@opentelemetry/api';
import * as Sentry from '@sentry/nextjs';

import type { Instrumentation } from 'next';

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

// 서버 렌더·라우트 오류를 한 줄 JSON 으로도 남긴다. Sentry 는 표본·폭주 제한이 걸려 «몇 번 났나»를 셀 수 없고,
// Next 기본 출력은 스택이 줄마다 흩어져 로그에서 한 건으로 묶이지 않았다. 세기·찾기는 로그에서 msg=ssr_request_error 로,
// 트레이스는 trace_id 로 잇는다.
export const onRequestError: Instrumentation.onRequestError = (error, request, context) => {
  const err = error as (Error & { digest?: string }) | undefined;
  // console.* 는 운영 빌드에서 지워진다(next.config compiler.removeConsole) — stdout 에 직접 쓴다. edge 런타임엔 stdout 이 없다.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    process.stdout.write(
      JSON.stringify({
        msg: 'ssr_request_error',
        level: 'error',
        route: context.routePath,
        routeType: context.routeType,
        renderSource: context.renderSource,
        method: request.method,
        error: err?.name,
        message: String(err?.message ?? error).slice(0, 200),
        digest: err?.digest,
        trace_id: trace.getActiveSpan()?.spanContext().traceId,
      }) + '\n',
    );
  }
  return Sentry.captureRequestError(error, request, context);
};
