'use client';

import { formatCountdown, nextKstMidnight } from '@jirum/domain/toss-time-deal';

import { useNow } from '@/shared/hooks/useNow';
import { cn } from '@/shared/lib/cn';

/**
 * 「오늘 특가 종료까지 3:07:09 · 밤 12시 새 특가 오픈」 — 토스 앱 하루특가 상단 타이머와 같은 역할.
 * 토스 하루특가는 전부 KST 자정에 끝나고 그 순간 다음 날 특가가 열려 타이머 하나가 종료·오픈을 같이 센다.
 * 앱 TimeDealTimerBar 와 같다.
 */
export default function TimeDealTimerBar({ className }: { className?: string }) {
  const now = useNow();
  const left = now == null ? null : nextKstMidnight(now) - now;
  return (
    <div className={cn('flex flex-wrap items-center gap-x-1.5 text-sm', className)}>
      <span className="text-gray-600">오늘 특가 종료까지</span>
      <span className="text-error-600 font-semibold tabular-nums">
        {left == null ? '-:--:--' : formatCountdown(left)}
      </span>
      <span className="text-gray-400">· 밤 12시 새 특가 오픈</span>
    </div>
  );
}
