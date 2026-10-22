import { text } from '@jirum/design-system/recipes';
import { getTimeDealOpening, getTossTimeDeal } from '@jirum/domain/toss-time-deal';

import { cn } from '@/shared/lib/cn';

import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import TimeDealCountdown from '@/entities/product-list/ui/card/TimeDealCountdown';

/**
 * 카드 가격 줄 — 토스 하루특가면 토스 앱처럼 「하루만 N원」과 「N명이 봤어요」를 붙이고,
 * 아직 안 연 시간 한정 딜(토스 다음 날 특가·커뮤니티 예고 글)이면 「오픈까지 H:MM:SS」를 단다.
 * 그 밖의 상품은 DisplayListPrice 그대로. 그리드·캐러셀 카드가 같이 쓴다(앱 TossTimeDealPrice 와 같다).
 */
export default function TossTimeDealPrice({
  product,
  priceClassName,
}: {
  product: Pick<ProductCardType, 'price' | 'data' | 'title' | 'postedAt' | 'isEnd'>;
  priceClassName?: string;
}) {
  const timeDeal = getTossTimeDeal(product.data);
  const opening = getTimeDealOpening(product);
  return (
    <>
      <div className="flex items-center gap-1 pt-1">
        {timeDeal?.pricePrefix && (
          <span className="text-error-600 shrink-0 text-xs font-semibold">
            {timeDeal.pricePrefix}
          </span>
        )}
        <div className="min-w-0 flex-1 overflow-hidden">
          <DisplayListPrice price={product.price} className={priceClassName} />
        </div>
      </div>
      {opening ? (
        <TimeDealCountdown openAt={opening.openAt} />
      ) : (
        timeDeal?.viewCountText && (
          <span className={cn(text.caption, 'truncate pt-0.5')}>{timeDeal.viewCountText}</span>
        )
      )}
    </>
  );
}
