// Sentry 소음 거르기 — 클라이언트·서버·엣지 init 이 같이 쓴다.
//
// ★왜(2026-10-16): 무료 에러 할당량(월 5천)을 열흘 만에 다 써서 10/8 부터 하루 1~2천 건이 전부 rate_limited 로
// 버려졌다. 앱 에러도 같은 조직 할당량이라 함께 사라졌다. 채운 건 대부분 고칠 게 없는 것들이었다 —
// 요청 도중 사용자가 떠남(aborted·stream closed early), 없는 딜(404 화면이 정상 흐름), 광고·확장 스크립트,
// 그리고 백엔드·검색엔진이 잠깐 죽을 때 같은 에러가 요청마다 수천 건.
import type { ErrorEvent } from '@sentry/nextjs';

// 에러 표본 비율 — 거르고 남은 웹 에러가 아직 하루 ~650건이었다(10/16 stats_v2, 앱 ~25건). 무료 할당량은 앱과 합쳐
// 월 5천이고 매달 20일에 초기화되는데, 7~9월 내내 4~19일 만에 바닥나 나머지 기간은 장애가 하나도 안 보였다.
// 15% 면 하루 ~100건 = 월 ~3천 + 앱 ~1천. 반복되는 문제는 표본으로도 충분히 보이고, 놓치는 건 한 번뿐인 에러다.
// 키별 상한(Custom Rate Limits)은 Business 요금제 전용이라 코드에서 줄인다(2026-10-17).
export const SENTRY_ERROR_SAMPLE_RATE = 0.15;

export const SENTRY_IGNORE_ERRORS: (string | RegExp)[] = [
  'PRODUCT_NOT_FOUND',
  /^aborted$/,
  'The destination stream closed early',
  'Talisman extension',
  'Non-Error promise rejection captured with value: undefined',
  /Blocked a frame with origin/,
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
