'use client';

import { type ReactNode, useEffect, useState } from 'react';

import RestrictedNotice from './RestrictedNotice';

/**
 * 홈 입력창 가드. `/quota` 의 `allowed` 가 false 면 입력·예시 칩을 닫는다.
 *
 * ★진짜 강제는 chat `/ask` 의 403 이다. 여기는 UX — 막아 놓고도 타이핑되면
 * 방으로 들어갔다가 거절되는 헛발걸음이 생긴다.
 */
export default function AskLock({ children }: { children: ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/quota', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((q: { allowed?: boolean } | null) => {
        if (!alive) return;
        // 필드가 없으면(옛 서버) 열어 둔다 — 게이트는 /ask 가 한다
        setAllowed(q?.allowed !== false);
      })
      .catch(() => {
        if (alive) setAllowed(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (allowed === false) return <RestrictedNotice />;
  return children;
}
