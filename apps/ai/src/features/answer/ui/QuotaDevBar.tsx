'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Tier } from '../model/quota';

/**
 * 쿼터 조작 바. **개발용** — 벽까지 가는 흐름을 매번 3번 질문해서 확인하지 않아도 되게.
 *
 * ★이제 **서버 쿼터**(`chat_quota`)를 읽고 리셋한다. 예전엔 localStorage 목업이라
 * 여기서 초기화해도 서버 카운터는 그대로였고, 화면만 "0/3"이 되고 질문하면 429 가 났다.
 *
 * 티어 버튼은 **표시만** 한다 — 티어는 로그인 여부로 서버가 정하므로 클라가 바꿀 수 없다.
 * (예전 목업은 localStorage 로 티어를 바꿨는데, 서버가 정본이 된 지금은 거짓말이 된다.)
 *
 * ponytail: 임시. 프로덕션 빌드에선 렌더되지 않는다(page.tsx 분기) + API 도 404.
 */

type ServerQuota = { tier: Tier; used: number; limit: number };

export default function QuotaDevBar() {
  const [quota, setQuota] = useState<ServerQuota | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/quota', { cache: 'no-store' });
      if (res.ok) setQuota((await res.json()) as ServerQuota);
    } catch {
      // 서버가 안 떠 있으면 바를 그냥 숨긴다 — 개발 보조라 실패해도 앱은 정상
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reset = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/dev/quota-reset', { method: 'POST' });
      if (res.ok) setQuota((await res.json()) as ServerQuota);
    } catch {
      /* 무시 — 아래 finally 가 버튼을 풀어준다 */
    } finally {
      setBusy(false);
    }
  };

  if (!quota) return null;

  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-3 py-2.5 text-[12px] text-gray-500">
      <div className="flex items-center justify-between gap-2">
        <span>
          서버 쿼터 · <b className="text-gray-700">{quota.tier}</b>{' '}
          <span className="tabular-nums">
            {quota.used}/{quota.limit}
          </span>
        </span>
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="tappable rounded-full border border-gray-300 bg-white px-2.5 py-1 font-medium text-gray-700 active:bg-gray-50 disabled:opacity-40"
        >
          {busy ? '초기화 중…' : '초기화'}
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-snug">
        티어는 로그인 여부로 <b>서버가</b> 정해요 (익명 3 / 로그인 10).
        {quota.tier === 'anon' && ' 회원 한도를 보려면 web 에서 로그인하세요.'}
      </p>
    </div>
  );
}
