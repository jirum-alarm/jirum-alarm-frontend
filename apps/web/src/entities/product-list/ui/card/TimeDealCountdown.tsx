'use client';

import { formatCountdown } from '@jirum/domain/toss-time-deal';

import { useNow } from '@/shared/hooks/useNow';

/** 카드 한 줄 「오픈까지 2:10:33」 — 오픈 시각이 지나면 「지금 오픈」. 앱 TimeDealCountdown 과 같다. */
export default function TimeDealCountdown({ openAt }: { openAt: number }) {
  const now = useNow();
  // 하이드레이션 전엔 자리만 잡아 둔다(카드 높이가 뒤늦게 바뀌지 않게).
  if (now == null) {
    return <span className="invisible pt-0.5 text-xs">오픈까지 0:00:00</span>;
  }
  const left = openAt - now;
  return (
    <span className="text-error-600 truncate pt-0.5 text-xs font-semibold tabular-nums">
      {left > 0 ? `오픈까지 ${formatCountdown(left)}` : '지금 오픈'}
    </span>
  );
}
