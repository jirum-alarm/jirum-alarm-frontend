import React, {useState} from 'react';
import {View} from 'react-native';
import {formatCountdown, getTimeDealTimer} from '@jirum/domain/toss-time-deal';

import {Text} from '@/shared/components/ui/Text/AppText';
import {useNow} from '@/shared/hooks/useNow';
import {cn} from '@/shared/lib/styling';

type Props = {
  product: Parameters<typeof getTimeDealTimer>[0];
  className?: string;
};

const TABULAR = {fontVariant: ['tabular-nums' as const]};

/**
 * 상세 가격 아래 타이머 한 줄 — 「오늘 밤 12시 종료 · 3:12:45 남음」 / 「오늘 17:00 오픈 · 오픈까지 2:10:33」 /
 * 「선착순 마감」. web entities/promotion/ui/TimeDealDetailTimer 와 같다.
 * 무엇을 셀지는 상세를 연 시각에 한 번 정한다 — 0이 되면 「끝났어요」/「지금 오픈」으로 바꾸고 다시 세지 않는다.
 */
export default function TimeDealDetailTimer({product, className}: Props) {
  const [timer] = useState(() => getTimeDealTimer(product));
  if (!timer) return null;
  if (timer.kind === 'soldOut') {
    return (
      <Text className={cn('pt-2 text-sm text-gray-500', className)}>
        {timer.label}
        {timer.label === '선착순 마감' && ' · 밤 12시 새 특가 오픈'}
      </Text>
    );
  }
  return <Countdown timer={timer} className={className} />;
}

// 1초 시계는 이 줄만 다시 그리게 따로 둔다(상세 본문 전체가 매초 렌더되지 않게).
function Countdown({
  timer,
  className,
}: {
  timer: Exclude<ReturnType<typeof getTimeDealTimer>, null | {kind: 'soldOut'}>;
  className?: string;
}) {
  const now = useNow();
  const closing = timer.kind === 'closing';
  const left = (closing ? timer.endAt : timer.openAt) - now;
  const count = formatCountdown(left);
  return (
    <View
      className={cn(
        'flex-row flex-wrap items-center gap-x-1.5 pt-2',
        className,
      )}
      accessible
      accessibilityRole="timer"
      accessibilityLabel={
        left <= 0
          ? closing
            ? '특가가 끝났어요'
            : '지금 오픈'
          : closing
          ? `${timer.endLabel}, ${count} 남음`
          : `${timer.label}, 오픈까지 ${count}`
      }>
      <Text className="text-sm text-gray-700">
        {closing ? timer.endLabel : timer.label}
      </Text>
      {/* eslint-disable-next-line no-restricted-syntax -- 구분점(글자 아님) */}
      <Text className="text-sm text-gray-400">·</Text>
      {left <= 0 ? (
        <Text className="text-sm text-gray-500">
          {closing ? '특가가 끝났어요' : '지금 오픈'}
        </Text>
      ) : closing ? (
        <Text className="text-sm text-gray-600">
          <Text className="font-semibold text-error-600" style={TABULAR}>
            {count}
          </Text>{' '}
          남음
        </Text>
      ) : (
        <Text className="text-sm text-gray-600">
          오픈까지{' '}
          <Text className="font-semibold text-error-600" style={TABULAR}>
            {count}
          </Text>
        </Text>
      )}
    </View>
  );
}
