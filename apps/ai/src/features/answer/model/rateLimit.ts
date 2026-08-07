/**
 * IP당 레이트 리밋 (인메모리 슬라이딩 윈도).
 *
 * 왜 필요한가: `/api/ask` 는 공개·무인증이고 **요청 하나가 운영 GraphQL 호출 하나로
 * 그대로 번역된다**. 실측(2026-08-07): 리밋 없이 10연타 전부 200. 스크립트 한 줄로
 * 운영 API 를 두드릴 수 있다. 설계문서 게이트 G8 항목.
 *
 * 인메모리인 이유: 파드가 하나뿐이고(운영 replicas=1) Redis 를 새로 물릴 만한
 * 가치가 아직 없다. 파드가 늘면 리밋이 파드 수만큼 느슨해지므로 그때 공유 저장소로 옮긴다.
 * ponytail: 파드 1개 전제. replicas 늘리면 Valkey 로 이전.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;

/** IP → 최근 요청 타임스탬프. 윈도 밖은 조회 시점에 잘라낸다. */
const hits = new Map<string, number[]>();

/** Map 이 무한히 자라지 않게 — 이 크기를 넘으면 오래된 키부터 비운다. */
const MAX_KEYS = 10_000;

export type RateVerdict = { ok: true } | { ok: false; retryAfterSec: number };

/**
 * 프록시 뒤에서 클라이언트 IP 를 뽑는다.
 * ⚠️ `x-forwarded-for` 는 위조 가능하다 — 신뢰 가능한 프록시(ingress)가 앞에 있을 때만
 * 의미가 있다. 우회를 완전히 막는 게 아니라 우발적 폭주와 단순 스크립트를 막는 게 목적.
 */
export const clientIp = (req: Request): string => {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip')?.trim() || 'unknown';
};

export const checkRate = (ip: string, now = Date.now()): RateVerdict => {
  if (hits.size > MAX_KEYS) hits.clear();

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_PER_WINDOW) {
    const oldest = recent[0];
    hits.set(ip, recent);
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((WINDOW_MS - (now - oldest)) / 1000)),
    };
  }

  recent.push(now);
  hits.set(ip, recent);
  return { ok: true };
};

/** 테스트용 — 상태를 비운다. */
export const resetRate = () => hits.clear();

export const RATE_LIMIT = { WINDOW_MS, MAX_PER_WINDOW } as const;
