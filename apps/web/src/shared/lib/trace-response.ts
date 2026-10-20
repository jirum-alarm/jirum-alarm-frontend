// 응답에 W3C traceresponse 헤더(`00-<traceId>-<spanId>-01`)를 싣는다 — 서버(Node 런타임) 전용.
//
// ★왜(2026-10-20): istio 게이트웨이 액세스 로그가 `"trace":"%RESP(TRACERESPONSE)%"` 를 찍고 Grafana 가 그 값으로
// Loki 줄 → Tempo 트레이스 링크를 만든다. 백엔드 Node 앱은 instrumentation-http responseHook 으로 이미 싣는데
// (gitops components/otel-node/preload.js), web 은 비어 있어 게이트웨이 로그에서 느린 페이지의 트레이스로 못 넘어갔다.
//
// ★어디서: @sentry/nextjs 는 Sentry 자체의 incoming http span 을 끄고(disableIncomingRequestSpans) Next 의
// BaseServer.handleRequest span 을 루트로 쓴다 → httpIntegration 의 responseHook·incomingRequestSpanHook 은
// incoming 에 안 불린다. 그래서 ServerResponse.prototype.writeHead 를 감싸, 헤더가 나가는 순간의 활성 span 의
// 루트(= 요청 span)를 쓴다. 암묵 헤더(첫 write/end)도 내부적으로 writeHead 를 거친다.
//
// 샘플된(traceFlags SAMPLED) span 만 — Tempo 에 실제로 있는 트레이스만 링크한다(웹 tracesSampleRate 0.1 이라 ~10%).
import { ServerResponse } from 'node:http';

import { type Span, type SpanContext, trace, TraceFlags } from '@opentelemetry/api';

const HEADER = 'traceresponse';

/** 샘플된 유효 span 이면 traceresponse 값, 아니면 undefined. */
export const traceResponseValue = (sc: SpanContext | undefined): string | undefined => {
  if (!sc || !trace.isSpanContextValid(sc) || !(sc.traceFlags & TraceFlags.SAMPLED))
    return undefined;
  return `00-${sc.traceId}-${sc.spanId}-01`;
};

const PATCHED = Symbol.for('jirum.traceresponse.patched');

/** 한 번만 감싼다. getRootSpan 은 Sentry 의 것을 주입받는다(OTel API 엔 루트 개념이 없다). */
export const enableTraceResponseHeader = (
  getRootSpan: (span: Span) => { spanContext(): SpanContext },
): void => {
  const proto = ServerResponse.prototype as ServerResponse & { [PATCHED]?: true };
  if (proto[PATCHED]) return;
  proto[PATCHED] = true;
  const original = proto.writeHead;
  proto.writeHead = function writeHead(this: ServerResponse, ...args: unknown[]) {
    try {
      if (!this.headersSent && !this.hasHeader(HEADER)) {
        const active = trace.getActiveSpan();
        const value = active && traceResponseValue(getRootSpan(active).spanContext());
        if (value) this.setHeader(HEADER, value);
      }
    } catch {
      // 헤더 하나 때문에 응답이 깨지면 안 된다.
    }
    return (original as (...a: unknown[]) => ServerResponse).apply(this, args);
  } as typeof proto.writeHead;
};
