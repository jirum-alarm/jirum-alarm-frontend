'use client';

import { useEffect, useState } from 'react';

import { displayTime, toIsoInstant } from '@/shared/lib/format';

/**
 * 상대 시각("3시간 전") + `<time datetime>` 절대 시각 — web shared/ui/DisplayTime.tsx 와 같다.
 * 상대 시각은 "지금"에 달려 서버 렌더 시점과 다르므로 하이드레이션 뒤 브라우저 시각으로 다시 계산한다.
 */
export default function DisplayTime({ time }: { time: string }) {
  const [mountedText, setMountedText] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 하이드레이션 뒤 브라우저 시각으로 다시 계산한다.
    setMountedText(displayTime(time));
  }, [time]);

  const text = mountedText || displayTime(time);
  const iso = toIsoInstant(time);
  if (!iso) return <span suppressHydrationWarning>{text}</span>;
  return (
    <time dateTime={iso} suppressHydrationWarning>
      {text}
    </time>
  );
}
