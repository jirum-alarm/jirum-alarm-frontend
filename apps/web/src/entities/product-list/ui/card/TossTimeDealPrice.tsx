import { getTossTimeDeal } from '@jirum/domain/toss-time-deal';

import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';

/**
 * 카드 가격 줄 — 토스 하루특가면 토스 앱처럼 「하루만 N원」과 「N명이 봤어요」를 붙인다.
 * 그 밖의 상품은 DisplayListPrice 그대로. 그리드·캐러셀 카드가 같이 쓴다(앱 TossTimeDealPrice 와 같다).
 */
export default function TossTimeDealPrice({
  price,
  data,
  priceClassName,
}: {
  price?: string | null;
  data?: unknown;
  priceClassName?: string;
}) {
  const timeDeal = getTossTimeDeal(data);
  return (
    <>
      <div className="flex items-center gap-1 pt-1">
        {timeDeal?.pricePrefix && (
          <span className="text-error-600 shrink-0 text-xs font-semibold">
            {timeDeal.pricePrefix}
          </span>
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <DisplayListPrice price={price} className={priceClassName} />
        </div>
      </div>
      {timeDeal?.viewCountText && (
        <span className="truncate pt-0.5 text-xs text-gray-500">{timeDeal.viewCountText}</span>
      )}
    </>
  );
}
