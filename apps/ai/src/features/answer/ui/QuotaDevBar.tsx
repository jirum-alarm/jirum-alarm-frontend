'use client';

import { useEffect, useState } from 'react';

import { QUOTA } from '../model/quota';
import { readQuota, resetQuota, setTier } from '../model/quotaStore';

import type { QuotaState, Tier } from '../model/quota';

/**
 * 쿼터 목업 조작 바. **개발용** — 벽까지 가는 흐름을 매번 3번 질문해서 확인하지 않아도 되게.
 *
 * 서버 강제가 붙으면 이 파일과 quotaStore 를 통째로 지운다.
 * ponytail: 목업 전용. 프로덕션 빌드에서는 렌더되지 않는다(page.tsx 에서 분기).
 */

const TIERS: Tier[] = ['anon', 'member', 'paid'];

/**
 * `serverTier` 가 있으면(=실제 로그인) 티어 버튼은 잠근다. 목업 버튼으로 로그인
 * 상태를 덮어쓸 수 있으면, 서버가 정하는 티어라는 규칙이 화면에서만 거짓이 된다.
 */
export default function QuotaDevBar({ serverTier }: { serverTier?: Tier }) {
  // localStorage 는 서버에 없다 — 마운트 후에 읽어야 hydration 이 어긋나지 않는다
  const [quota, setQuota] = useState<QuotaState | null>(null);
  useEffect(() => setQuota(readQuota(serverTier)), [serverTier]);

  if (!quota) return null;

  const locked = serverTier != null;

  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-3 py-2.5 text-[12px] text-gray-500">
      <div className="flex items-center justify-between gap-2">
        <span>
          목업 쿼터 · <b className="text-gray-700">{quota.tier}</b>{' '}
          <span className="tabular-nums">
            {quota.used}/{QUOTA[quota.tier].limit}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setQuota(resetQuota())}
          className="tappable rounded-full border border-gray-300 bg-white px-2.5 py-1 font-medium text-gray-700 active:bg-gray-50"
        >
          초기화
        </button>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        {TIERS.map((t) => (
          <button
            key={t}
            type="button"
            disabled={locked}
            onClick={() => setQuota(setTier(t))}
            className={`tappable rounded-full px-2.5 py-1 disabled:opacity-40 ${
              quota.tier === t ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white'
            }`}
          >
            {t}
          </button>
        ))}
        {locked && <span className="ml-0.5 text-[11px]">← 실제 로그인 상태</span>}
      </div>
    </div>
  );
}
