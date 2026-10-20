import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createServer, get, type IncomingHttpHeaders } from 'node:http';
import { createRequire } from 'node:module';
import { test } from 'node:test';

import {
  type Context,
  context,
  type ContextManager,
  ROOT_CONTEXT,
  type SpanContext,
  trace,
  TraceFlags,
} from '@opentelemetry/api';

import type { AddressInfo } from 'node:net';

const require = createRequire(import.meta.url);
const { enableTraceResponseHeader, traceResponseValue } =
  require('./trace-response.ts') as typeof import('./trace-response');

const TRACE_ID = '0af7651916cd43dd8448eb211c80319c';
const SPAN_ID = 'b7ad6b7169203331';
const sc = (traceFlags: number): SpanContext => ({
  traceId: TRACE_ID,
  spanId: SPAN_ID,
  traceFlags,
});

test('샘플된 span 이면 traceresponse 값을 만든다', () => {
  assert.equal(traceResponseValue(sc(TraceFlags.SAMPLED)), `00-${TRACE_ID}-${SPAN_ID}-01`);
});

test('샘플 안 된 span·무효 span·span 없음은 싣지 않는다', () => {
  assert.equal(traceResponseValue(sc(TraceFlags.NONE)), undefined);
  assert.equal(
    traceResponseValue({ ...sc(TraceFlags.SAMPLED), traceId: '0'.repeat(32) }),
    undefined,
  );
  assert.equal(traceResponseValue(undefined), undefined);
});

// 실제 http 서버로: 핸들러의 활성 span 이 루트로 바뀌어 헤더에 실리는지, 활성 span 이 없으면 안 실리는지.
class AlsContextManager implements ContextManager {
  private readonly als = new AsyncLocalStorage<Context>();
  active(): Context {
    return this.als.getStore() ?? ROOT_CONTEXT;
  }
  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    ctx: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    return this.als.run(ctx, () => fn.apply(thisArg, args));
  }
  bind<T>(_ctx: Context, target: T): T {
    return target;
  }
  enable(): this {
    return this;
  }
  disable(): this {
    return this;
  }
}

const fetchHeaders = (port: number, path: string): Promise<IncomingHttpHeaders> =>
  new Promise((resolve, reject) => {
    get({ port, path }, (res) => {
      res.resume();
      resolve(res.headers);
    }).on('error', reject);
  });

test('writeHead 시점의 활성 span 의 루트로 헤더를 싣는다(암묵 헤더 포함)', async () => {
  context.setGlobalContextManager(new AlsContextManager());
  const root = trace.wrapSpanContext(sc(TraceFlags.SAMPLED));
  const child = trace.wrapSpanContext({ ...sc(TraceFlags.SAMPLED), spanId: 'aaaaaaaaaaaaaaaa' });
  enableTraceResponseHeader((span) => (span === child ? root : span));

  const server = createServer((req, res) => {
    if (req.url === '/none') return void res.end('x');
    context.with(trace.setSpan(context.active(), child), () => {
      // 비동기 경계를 넘어도(스트리밍 SSR 처럼) 컨텍스트가 이어지는지
      setImmediate(() => (req.url === '/explicit' ? res.writeHead(200).end('x') : res.end('x')));
    });
  });
  await new Promise<void>((r) => server.listen(0, r));
  const { port } = server.address() as AddressInfo;
  try {
    const want = `00-${TRACE_ID}-${SPAN_ID}-01`;
    assert.equal((await fetchHeaders(port, '/implicit')).traceresponse, want);
    assert.equal((await fetchHeaders(port, '/explicit')).traceresponse, want);
    assert.equal((await fetchHeaders(port, '/none')).traceresponse, undefined);
  } finally {
    server.close();
    context.disable();
  }
});
