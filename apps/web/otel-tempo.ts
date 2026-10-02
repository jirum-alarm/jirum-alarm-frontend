// 서버(SSR) 트레이스를 사내 Tempo 로도 보낸다 — Sentry 와 같은 span 을 공유한다(2026-10-02).
//
// ★왜: 백엔드 6개는 Tempo 에 트레이스가 있는데 사용자 입구인 web 만 없어서 "어느 페이지가 느린지·SSR 이 백엔드를
// 몇 번 부르는지"를 Grafana 에서 못 봤다. Sentry v8+ 는 자체가 OTel 이라 SDK 를 하나 더 띄우면 TracerProvider 가
// 충돌한다 → Sentry.init 의 openTelemetrySpanProcessors 로 exporter 만 하나 덧붙인다.
//
// ★두 가지 보정:
//  1) Sentry 는 resource service.name 을 'node' 로 고정한다 → Tempo 로 보낼 때만 env(OTEL_SERVICE_NAME·OTEL_RESOURCE_ATTRIBUTES)로 바꿔 끼운다.
//  2) Sentry 전파기는 sentry-trace·baggage 만 보내고 W3C traceparent 를 안 보낸다(node SDK 10.25, propagateTraceparent 는
//     브라우저 전용) → 백엔드(W3C) 트레이스가 끊긴다. traceparent 를 같이 싣는 합성 전파기로 바꾼다.
//
// OTEL_EXPORTER_OTLP_ENDPOINT 가 없으면(로컬·Vercel 등) 아무것도 안 한다 — Sentry 동작은 그대로.
import { propagation } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  type ExportResult,
} from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { detectResources, envDetector, type Resource } from '@opentelemetry/resources';
import {
  BatchSpanProcessor,
  type ReadableSpan,
  type SpanExporter,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { SentryPropagator } from '@sentry/opentelemetry';

const enabled = (): boolean => !!process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

/** span 의 resource 만 바꿔 내보낸다(나머지 필드는 원본을 프로토타입으로 그대로 읽는다). */
export class ResourceOverrideExporter implements SpanExporter {
  constructor(
    private readonly inner: SpanExporter,
    private readonly resource: Resource,
  ) {}

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    const overridden = spans.map(
      (span) => Object.create(span, { resource: { value: this.resource } }) as ReadableSpan,
    );
    this.inner.export(overridden, resultCallback);
  }

  shutdown(): Promise<void> {
    return this.inner.shutdown();
  }

  forceFlush(): Promise<void> {
    return this.inner.forceFlush?.() ?? Promise.resolve();
  }
}

export const tempoSpanProcessors = (): SpanProcessor[] => {
  if (!enabled()) return [];
  // envDetector: OTEL_SERVICE_NAME + OTEL_RESOURCE_ATTRIBUTES(k8s.pod.name 등 — Grafana 트레이스→로그 링크가 쓴다)
  const resource = detectResources({ detectors: [envDetector] });
  return [new BatchSpanProcessor(new ResourceOverrideExporter(new OTLPTraceExporter(), resource))];
};

/** Sentry.init 뒤에 부른다 — Sentry 가 등록한 전파기를 traceparent 포함 합성 전파기로 교체. */
export const enableW3CTracePropagation = (): void => {
  if (!enabled()) return;
  propagation.disable();
  propagation.setGlobalPropagator(
    new CompositePropagator({
      propagators: [new W3CTraceContextPropagator(), new SentryPropagator()],
    }),
  );
};
