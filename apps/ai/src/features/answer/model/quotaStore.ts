'use client';

import { QUOTA } from './quota.ts';

import type { QuotaState, Tier } from './quota.ts';

/**
 * 쿼터 카운터 — **목업 저장소**. localStorage 한 칸이다.
 *
 * 진짜로 막는 게 아니다(콘솔에서 지우면 리셋된다). 서버 강제는 익명=서명 쿠키,
 * 로그인·유료=DB 가 필요하고 그건 붙일 때 한다. 지금 필요한 건 화면이
 * "3회 → 벽 → 로그인 → 10회 → 벽" 순서로 실제로 흘러가는지 보는 것뿐이다.
 *
 * ponytail: localStorage 1칸. 서버 강제는 결제 붙일 때 같이.
 */

const KEY = 'jirum_ai_quota';

/** 리셋 경계는 KST 자정. 월 단위는 같은 문자열의 앞 7글자로 자른다. */
const periodKey = (tier: Tier, now = new Date()): string => {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const day = kst.toISOString().slice(0, 10); // YYYY-MM-DD
  return QUOTA[tier].period === '월' ? day.slice(0, 7) : day;
};

type Stored = { tier: Tier; period: string; used: number };

const parse = (raw: string | null): Stored | null => {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Stored;
    return typeof v?.used === 'number' && typeof v?.period === 'string' && v?.tier in QUOTA
      ? v
      : null;
  } catch {
    return null;
  }
};

/**
 * `serverTier` 가 오면 그게 진실이다 — 로그인 여부는 서버(me 쿼리)만 안다.
 * 저장된 tier 는 서버 판정이 없을 때(홈의 목업 바)만 쓴다.
 *
 * ⚠️ 서버 티어가 저장값과 다르면 **카운터를 리셋한다.** 로그인/로그아웃으로 한도가
 * 바뀌는데 예전 카운터를 이어받으면, 익명으로 3회 쓰고 로그인한 유저가 10회짜리
 * 한도에서 3회를 이미 쓴 상태로 시작한다(반대로 로그아웃은 우회로가 된다).
 */
export const readQuota = (serverTier?: Tier): QuotaState => {
  if (typeof window === 'undefined') return { tier: serverTier ?? 'anon', used: 0 };

  const stored = parse(localStorage.getItem(KEY));
  const tier = serverTier ?? stored?.tier ?? 'anon';

  const fresh = stored && stored.period === periodKey(tier) && stored.tier === tier;
  return { tier, used: fresh ? stored.used : 0 };
};

/** 질문 1건 소비. 소비 후 상태를 돌려준다. */
export const spendQuota = (serverTier?: Tier): QuotaState => {
  const { tier, used } = readQuota(serverTier);
  const next = { tier, used: used + 1 };
  localStorage.setItem(KEY, JSON.stringify({ ...next, period: periodKey(tier) } satisfies Stored));
  return next;
};

/** 목업 전용 — 카운터를 비운다. 티어는 익명으로 되돌린다. */
export const resetQuota = (): QuotaState => {
  localStorage.removeItem(KEY);
  return readQuota();
};

/** 목업 전용 — 티어를 바꿔 다음 단계 화면을 본다(카운터는 0으로). */
export const setTier = (tier: Tier): QuotaState => {
  localStorage.setItem(KEY, JSON.stringify({ tier, period: periodKey(tier), used: 0 }));
  return { tier, used: 0 };
};
