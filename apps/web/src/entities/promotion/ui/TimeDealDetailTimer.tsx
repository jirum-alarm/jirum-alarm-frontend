'use client';

import { formatCountdown, getTimeDealTimer } from '@jirum/domain/toss-time-deal';
import { useState } from 'react';

import { useNow } from '@/shared/hooks/useNow';
import { cn } from '@/shared/lib/cn';

type Props = {
  product: Parameters<typeof getTimeDealTimer>[0];
  className?: string;
};

/**
 * 상세 가격 아래 타이머 한 줄 — 「오늘 밤 12시 종료 · 3:12:45 남음」 / 「오늘 17:00 오픈 · 오픈까지 2:10:33」 /
 * 「선착순 마감」. 무신사 상세처럼 가격 바로 곁에 둔다(2026-10-15 모범사례 조사). 앱 detail/ui/TimeDealDetailTimer 와 같다.
 * 무엇을 셀지는 상세를 연 시각에 한 번 정한다 — 0이 되면 「끝났어요」/「지금 오픈」으로 바꾸고 다시 세지 않는다.
 * role="timer" 는 기본이 aria-live off 라 화면 읽기가 매초 읽지 않는다.
 */
export default function TimeDealDetailTimer({ product, className }: Props) {
  const [timer] = useState(() => getTimeDealTimer(product));
  const now = useNow();
  if (!timer) return null;

  const rowClass = cn('flex flex-wrap items-center gap-x-1.5 pt-2 text-sm', className);

  if (timer.kind === 'soldOut') {
    return (
      <p className={cn(rowClass, 'text-gray-500')}>
        {timer.label}
        {timer.label === '선착순 마감' && ' · 밤 12시 새 특가 오픈'}
      </p>
    );
  }

  const closing = timer.kind === 'closing';
  const left = now == null ? null : (closing ? timer.endAt : timer.openAt) - now;
  // 하이드레이션 전엔 자리만 잡아 둔다(줄 높이가 뒤늦게 바뀌지 않게).
  const count = (
    <span className={cn('text-error-600 font-semibold tabular-nums', left == null && 'invisible')}>
      {formatCountdown(left ?? 0)}
    </span>
  );

  return (
    <div
      role="timer"
      aria-label={closing ? '특가 종료까지 남은 시간' : '오픈까지 남은 시간'}
      className={rowClass}
    >
      <span className="text-gray-700">{closing ? timer.endLabel : timer.label}</span>
      <span className="text-gray-400" aria-hidden>
        ·
      </span>
      {left != null && left <= 0 ? (
        <span className="text-gray-500">{closing ? '특가가 끝났어요' : '지금 오픈'}</span>
      ) : closing ? (
        <span className="text-gray-600">{count} 남음</span>
      ) : (
        <span className="text-gray-600">오픈까지 {count}</span>
      )}
    </div>
  );
}
