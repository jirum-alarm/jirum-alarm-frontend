// Sentry 소음 거르기 — 클라이언트·서버·엣지 init 이 같이 쓴다.
//
// ★왜(2026-10-16): 무료 에러 할당량(월 5천)을 열흘 만에 다 써서 10/8 부터 하루 1~2천 건이 전부 rate_limited 로
// 버려졌다. 앱 에러도 같은 조직 할당량이라 함께 사라졌다. 채운 건 대부분 고칠 게 없는 것들이었다 —
// 요청 도중 사용자가 떠남(aborted·stream closed early), 없는 딜(404 화면이 정상 흐름), 광고·확장 스크립트,
// 그리고 백엔드·검색엔진이 잠깐 죽을 때 같은 에러가 요청마다 수천 건.
import type { ErrorEvent, Event } from '@sentry/nextjs';

// 에러 표본 비율 — 거르고 남은 웹 에러가 아직 하루 ~650건이었다(10/16 stats_v2, 앱 ~25건). 무료 할당량은 앱과 합쳐
// 월 5천이고 매달 20일에 초기화되는데, 7~9월 내내 4~19일 만에 바닥나 나머지 기간은 장애가 하나도 안 보였다.
// 15% 면 하루 ~100건 = 월 ~3천 + 앱 ~1천. 반복되는 문제는 표본으로도 충분히 보이고, 놓치는 건 한 번뿐인 에러다.
// 키별 상한(Custom Rate Limits)은 Business 요금제 전용이라 코드에서 줄인다(2026-10-17).
export const SENTRY_ERROR_SAMPLE_RATE = 0.15;

// 배포 환경 — 운영(deploy-web-prod)·스테이징(deploy-web-staging) 빌드만 NEXT_PUBLIC_SENTRY_ENVIRONMENT 를 넣는다.
// 비어 있으면(로컬·CI 화면 하네스) 보내지 않는다. 전엔 environment 를 안 정해 모든 빌드가 production 으로 들어왔고,
// 할당량이 초기화된 날 들어온 웹 에러 대부분이 CI 러너·로컬의 하네스 fixture 에러였다(2026-10-20).
export const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

export const SENTRY_IGNORE_ERRORS: (string | RegExp)[] = [
  'PRODUCT_NOT_FOUND',
  /^aborted$/,
  'The destination stream closed early',
  // 브라우저가 받는 RSC 실패의 껍데기 — 메시지가 가려져 있고(digest 뿐) 진짜 원인은 서버 Sentry 에 그대로 남는다.
  // 10/22 서버 롤아웃 때처럼 같은 장애 하나가 브라우저마다 한 건씩 쌓였다(2025/10~ 4.4천 건).
  'An error occurred in the Server Components render',
  'Connection closed.', // RSC 스트림이 끊김 — 이동·새로고침·파드 교체 중. 서버 쪽은 stream closed early 로 이미 거른다
  'Failed to find Server Action', // 옛 배포의 액션 id·스캐너의 임의 POST — 다음 페이지 요청이 새 번들을 받는다
  'Talisman extension',
  'Non-Error promise rejection captured with value: undefined',
  /Blocked a frame with origin/,
  'Failed to connect to MetaMask', // 지갑 확장
  /adsbygoogle\.push\(\) error/, // 애드센스가 같은 슬롯을 두 번 채우려 할 때 — 광고만 빠지고 화면은 정상
];

// 맨 위 스택 프레임 주소가 이 중 하나면 버린다(우리 코드가 아닌 스크립트의 에러).
export const SENTRY_DENY_URLS: RegExp[] = [
  /\/pagead\//,
  /googlesyndication\.com/,
  /googletagmanager\.com/,
  /google-analytics\.com/,
  /clarity\.ms/,
  /^(chrome|moz|safari(-web)?)-extension:/,
];

const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_MAX = 3;

const burstKey = (event: ErrorEvent) => {
  const exception = event.exception?.values?.[0];
  const text = exception ? `${exception.type}:${exception.value}` : (event.message ?? '');
  return text.slice(0, 120);
};

// 같은 에러는 한 실행 환경(서버 파드·브라우저 탭)에서 10분에 3건까지만 보낸다 — 장애 한 번이 할당량을 다 먹지 않게.
export function createBurstLimiter(now: () => number = Date.now) {
  const seen = new Map<string, { start: number; count: number }>();
  return (event: ErrorEvent): ErrorEvent | null => {
    const key = burstKey(event);
    const t = now();
    const entry = seen.get(key);
    if (!entry || t - entry.start > BURST_WINDOW_MS) {
      if (seen.size > 500) seen.clear();
      seen.set(key, { start: t, count: 1 });
      return event;
    }
    entry.count += 1;
    return entry.count <= BURST_MAX ? event : null;
  };
}

/**
 * 브라우저 에러 필터 — 헤드리스·크롤러 UA 에서 난 에러는 버리고(우리 SEO 점검·외부 스캐너가 옛 청크를 밟는 것뿐),
 * 나머지는 폭주 제한. 서버 에러엔 쓰지 않는다 — 봇이 밟아 난 서버 에러는 사람도 곧 밟는다.
 */
export function createClientErrorFilter(isCrawler: (ua: string) => boolean) {
  const limit = createBurstLimiter();
  return (event: ErrorEvent): ErrorEvent | null => {
    if (typeof navigator !== 'undefined' && isCrawler(navigator.userAgent)) return null;
    return limit(event);
  };
}

// 받자마자 버려지거나 볼 일 없는 트랜잭션은 보내지 않는다.
// ★왜(2026-10-20): 서버가 보낸 트랜잭션·span 의 절반 넘게가 Sentry «web-crawlers» 인바운드 필터로 그 자리에서
// 버려지고 있었다 — 버려질 것을 운영 파드가 집 회선 업로드로 꾸준히 올렸다.
//  - 크롤러 요청: Sentry 가 인바운드 필터로 버린다.
//  - 이미지 최적화(GET /_next/image)·미들웨어(op http.server.middleware): 수락된 서버 트랜잭션의 큰 몫인데
//    페이지 트랜잭션과 겹치고, 지연은 Tempo 에서 본다. 남겨 두면 span 할당량이 한 달을 못 간다.
// 샘플러(tracesSampler)가 아니라 전송 직전에 거르는 건, 서버 span 을 사내 Tempo 와 공유해서다 — 봇·이미지 SSR
// 트레이스는 Tempo 엔 그대로 남는다(봇 부하 분석에 쓴다). UA 는 서버는 요청 헤더, 브라우저는 navigator 에서 본다.
const requestUserAgent = (event: Event): string => {
  const headers =
    event.request?.headers ?? event.sdkProcessingMetadata?.normalizedRequest?.headers ?? {};
  return (
    headers['user-agent'] ??
    headers['User-Agent'] ??
    (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  );
};

// 서버 트랜잭션의 자식 span 은 Sentry 로는 추려서 보낸다.
// ★왜(2026-10-21): 서버 페이지 요청 하나가 백엔드 GraphQL 호출(http.client)과 Next.js 내부 단계(load route module 등)
// span 을 수십 개씩 달고 와 span 할당량 대부분을 차지했다. 그 세부는 Tempo 가 같은 트레이스로 다 갖고 있다.
// Sentry 엔 «어느 페이지가 느린가·에러가 어느 요청에서 났나»에 필요한 것만 남긴다 — 루트, 실패한 span,
// 페이지·라우트 단위 단계(KEPT_SERVER_SPAN).
// 샘플러가 아니라 전송 직전에 자르는 건 샘플러가 Tempo 와 공유라서다 — Tempo 로 가는 span 은 그대로다.
const KEPT_SERVER_SPAN =
  /^(render route|generateMetadata|executing api route|resolve page server component)/;

type SpanJSON = NonNullable<Event['spans']>[number];

const keepServerSpan = (span: SpanJSON): boolean =>
  (!!span.status && span.status !== 'ok') || KEPT_SERVER_SPAN.test(span.description ?? '');

// 남긴 span 의 부모가 잘렸으면 남은 가장 가까운 조상(없으면 루트)으로 잇는다 — 폭포 그림이 끊기지 않게.
function trimServerSpans(event: Event): void {
  const spans = event.spans;
  const rootId = event.contexts?.trace?.span_id;
  if (!spans || event.contexts?.trace?.op !== 'http.server') return;
  const byId = new Map(spans.map((span) => [span.span_id, span]));
  const kept = spans.filter(keepServerSpan);
  const keptIds = new Set(kept.map((span) => span.span_id));
  for (const span of kept) {
    let parent = span.parent_span_id;
    while (parent && parent !== rootId && !keptIds.has(parent)) {
      parent = byId.get(parent)?.parent_span_id;
    }
    span.parent_span_id = parent ?? rootId;
  }
  event.spans = kept;
}

// 브라우저 트랜잭션의 리소스 로딩 span(resource.script·img·link 등)은 보내지 않는다.
// ★왜(2026-10-21): 서버 span 을 추린 뒤 남은 할당량의 큰 몫이 페이지마다 수십 개씩 붙는 리소스 span 이었다.
// 웹 바이탈(LCP·FCP·CLS 등)은 루트의 measurements·속성(lcp.element 등)에 따로 실려 리소스 span 없이도 그대로 남고,
// 에러는 trace_id 로 트랜잭션에 이어진다. 리소스별 크기·지연은 개발자 도구·Lighthouse 로 본다.
function dropResourceSpans(event: Event): void {
  if (!event.spans || event.contexts?.trace?.op === 'http.server') return;
  event.spans = event.spans.filter((span) => !span.op?.startsWith('resource.'));
}

// 크롤러 판정은 shared/config/user-agent 의 isCrawlerUA 를 넘긴다(이 파일은 node --test 가 바로 읽게 의존 없이 둔다).
export function createTransactionFilter(isCrawler: (ua: string) => boolean) {
  return <T extends Event>(event: T): T | null => {
    if (event.transaction === 'GET /_next/image') return null;
    if (event.contexts?.trace?.op === 'http.server.middleware') return null;
    if (isCrawler(requestUserAgent(event))) return null;
    trimServerSpans(event);
    dropResourceSpans(event);
    return event;
  };
}
