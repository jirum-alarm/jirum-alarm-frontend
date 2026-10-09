import Badge, { type BadgeProps } from '@/shared/ui/common/Badge';

import { type TossProductData } from '../model/toss-data';

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
  const badges: { key: string; label: string; tone: BadgeProps['tone'] }[] = [];
  if (!hidePriceSignals && toss.lowestPriceCompensation)
    badges.push({ key: 'lpc', label: '최저가 보상', tone: 'secondary' });
  if (toss.arrivalGuaranteed) badges.push({ key: 'ag', label: '도착보장', tone: 'success' });
  if (toss.specialProduct) badges.push({ key: 'sp', label: '토스특가', tone: 'error' });
  if (!hidePriceSignals && toss.lowestIn30Days)
    badges.push({ key: 'l30', label: '30일 최저가', tone: 'error' });

  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {badges.map((b) => (
        <Badge key={b.key} size="md" tone={b.tone}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}
