import Badge, { type BadgeProps } from '@/shared/ui/common/Badge';

import { type TossProductData } from '../model/toss-data';

import ExplainedBadge from './ExplainedBadge';

import type { ReactNode } from 'react';

// 토스 딜 신뢰 배지 — 목록 카드와 상세페이지에서 공용. 희소할수록 앞에.
// bestSeller 는 27/30 로 흔해 여기 안 넣음(카드 썸네일 오버레이 전용).
export default function TossBadges({
  toss,
  hidePriceSignals,
}: {
  toss: TossProductData;
  /** 토스 특가 코너 유입 — 최저가 보상·30일 최저가는 가격 신호라 숨긴다. */
  hidePriceSignals?: boolean;
}) {
  // explain = 누르면 뜨는 뜻(토스 상품 정보의 배지 의미, 짧게).
  const badges: { key: string; label: string; tone: BadgeProps['tone']; explain: ReactNode }[] = [];
  if (!hidePriceSignals && toss.lowestPriceCompensation)
    badges.push({
      key: 'lpc',
      label: '최저가 보상',
      tone: 'secondary',
      explain: (
        <>
          다른 곳이 더 싸면 토스가
          <br />
          차액을 보상해 주는 상품이에요
        </>
      ),
    });
  if (toss.arrivalGuaranteed)
    badges.push({
      key: 'ag',
      label: '도착보장',
      tone: 'success',
      explain: (
        <>
          약속한 날까지 도착을
          <br />
          보장하는 상품이에요
        </>
      ),
    });
  if (toss.specialProduct)
    badges.push({
      key: 'sp',
      label: '토스특가',
      tone: 'error',
      explain: (
        <>
          토스쇼핑이 기간 한정으로
          <br />
          할인하는 특가 상품이에요
        </>
      ),
    });
  if (!hidePriceSignals && toss.lowestIn30Days)
    badges.push({
      key: 'l30',
      label: '30일 최저가',
      tone: 'error',
      explain: (
        <>
          최근 30일 토스 판매가 중
          <br />
          가장 낮은 가격이에요
        </>
      ),
    });

  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {badges.map((b) => (
        <ExplainedBadge key={b.key} explain={b.explain}>
          <Badge size="md" tone={b.tone}>
            {b.label}
          </Badge>
        </ExplainedBadge>
      ))}
    </div>
  );
}
