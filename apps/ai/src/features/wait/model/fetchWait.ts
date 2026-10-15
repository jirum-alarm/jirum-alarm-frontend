import { cookies } from 'next/headers';

import type { WaitEstimate } from './types';

/**
 * crawling-server GraphQL 호출 — **서버에서만**. 로그인 토큰(ACCESS_TOKEN, httpOnly·.jirum-alarm.com)을 그대로 실어 보낸다
 * (session.ts 와 같은 경로·같은 이유).
 */
const ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://jirum-alarm.com/api/graphql';

const DEAL = 'id title price unitPrice postedAt isEnd';
const WAIT_QUERY = `
  query AiWaitEstimate($text: String!) {
    waitEstimate(text: $text) {
      label kind keyword candidates { keyword dealCount } excludeKeywords unit priceFloor priceCeiling
      verdict confident dealCount rawMatchCount windowDays p10 median goodPrice goodDays typicalGapDays lastGoodAt
      current { ${DEAL} } currentPercentile goodDealCount goodDeals { ${DEAL} } liveDeals { ${DEAL} }
      points { postedAt unitPrice live }
      watching
    }
  }
`;

const ADD_WATCH = `
  mutation AiWaitWatch($text: String!) {
    addWaitWatch(text: $text) { keyword priced created }
  }
`;

export type GqlFailure = 'login' | 'forbidden' | 'failed';

type GqlResult<T> = { ok: true; data: T } | { ok: false; reason: GqlFailure; message?: string };

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<GqlResult<T>> {
  const token = (await cookies()).get('ACCESS_TOKEN')?.value;
  if (!token) return { ok: false, reason: 'login' };
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/graphql-response+json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    });
    const json = (await res.json().catch(() => null)) as {
      data?: T;
      errors?: { message?: string; extensions?: { code?: string } }[];
    } | null;
    const err = json?.errors?.[0];
    if (err) {
      const code = err.extensions?.code;
      // 가드 거절(토큰 만료·게스트)도 FORBIDDEN 으로 온다 — 서비스가 던진 「준비 중」만 허용 목록 밖으로 본다.
      if (code === 'FORBIDDEN' && err.message?.includes('준비 중')) {
        return { ok: false, reason: 'forbidden', message: err.message };
      }
      if (code === 'UNAUTHENTICATED' || code === 'FORBIDDEN') return { ok: false, reason: 'login' };
      return { ok: false, reason: 'failed', message: err.message };
    }
    if (!res.ok || !json?.data) return { ok: false, reason: 'failed' };
    return { ok: true, data: json.data };
  } catch (e) {
    console.error('[ai] wait gql failed:', e);
    return { ok: false, reason: 'failed' };
  }
}

export async function fetchWaitEstimate(text: string) {
  const r = await gql<{ waitEstimate: WaitEstimate | null }>(WAIT_QUERY, { text });
  return r.ok ? ({ ok: true, data: r.data.waitEstimate } as const) : r;
}

/** 「이 가격 오면 알려줘」 — 서버가 같은 판정을 다시 내 조건을 건다(기준가를 클라이언트가 보내지 않는다). */
export async function addWatch(text: string) {
  return gql<{ addWaitWatch: { keyword: string; priced: boolean; created: boolean } }>(ADD_WATCH, {
    text,
  });
}
