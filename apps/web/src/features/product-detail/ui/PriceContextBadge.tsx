import { cn } from '@/shared/lib/cn';

// "왜 핫딜인지" 가격 컨텍스트 배지.
// 백엔드 priceContext resolver 가 게이트(카테고리/통화/양수/floor/sanity/mallCount) 통과 시에만
// 값을 내려준다 → 여기서는 "있으면 표시"만. 게이트 로직 재구현 금지(DRY, 백엔드 단일 진실원천).
type PriceContextBadgeProps = {
  priceContext?: {
    dealPrice: number;
    danawaPrice: number;
    delta: number;
    normalPriceMin?: number | null;
    normalPriceMax?: number | null;
    danawaProductName?: string | null;
  } | null;
};

export default function PriceContextBadge({ priceContext }: PriceContextBadgeProps) {
  if (!priceContext) return null;

  const { danawaPrice, delta, normalPriceMin, normalPriceMax, danawaProductName } = priceContext;
  const percent = Math.round(delta * 100);
  const hasRange =
    typeof normalPriceMin === 'number' &&
    typeof normalPriceMax === 'number' &&
    normalPriceMin > 0 &&
    normalPriceMax > 0;

  return (
    <div
      className={cn(
        'mt-3 rounded-[10px] border border-primary-200 bg-primary-50 px-[13px] py-[11px]',
      )}
    >
      <div className="flex items-center gap-[7px] text-sm font-semibold text-primary-600">
        <span aria-hidden>🔥</span>
        <span>다나와 최저가 대비</span>
        <span className="rounded-md bg-primary-500 px-[7px] py-px text-xs font-bold text-white">
          {percent}% ↓
        </span>
      </div>
      {danawaProductName && (
        <p className="mt-[5px] text-[12.5px] text-gray-500">
          다나와 <span className="font-medium text-gray-700">{danawaProductName}</span> 최저가{' '}
          <span className="font-medium text-gray-700">{danawaPrice.toLocaleString()}원</span>
        </p>
      )}
      {hasRange && (
        <p className="mt-[6px] border-t border-dashed border-gray-200 pt-[6px] text-xs text-gray-500">
          정상가 범위 {normalPriceMin!.toLocaleString()} ~ {normalPriceMax!.toLocaleString()}원
        </p>
      )}
    </div>
  );
}
