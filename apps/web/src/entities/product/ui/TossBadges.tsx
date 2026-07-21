import { type TossProductData } from '../model/toss-data';

// 토스 딜 신뢰 배지 — 목록 카드와 상세페이지에서 공용. 희소할수록 앞에.
// bestSeller 는 27/30 로 흔해 여기 안 넣음(카드 썸네일 오버레이 전용).
export default function TossBadges({ toss }: { toss: TossProductData }) {
  const badges: { key: string; label: string; className: string }[] = [];
  if (toss.lowestPriceCompensation)
    badges.push({ key: 'lpc', label: '최저가 보상', className: 'bg-blue-50 text-blue-600' });
  if (toss.arrivalGuaranteed)
    badges.push({ key: 'ag', label: '도착보장', className: 'bg-green-50 text-green-600' });
  if (toss.specialProduct)
    badges.push({ key: 'sp', label: '토스특가', className: 'bg-error-50 text-error-600' });
  if (toss.lowestIn30Days)
    badges.push({ key: 'l30', label: '30일 최저가', className: 'bg-error-50 text-error-600' });

  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 pt-2">
      {badges.map((b) => (
        <span
          key={b.key}
          className={`rounded px-2 py-0.5 text-xs font-medium whitespace-nowrap ${b.className}`}
        >
          {b.label}
        </span>
      ))}
    </div>
  );
}
