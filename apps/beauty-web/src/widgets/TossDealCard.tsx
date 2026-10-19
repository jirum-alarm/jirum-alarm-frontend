import { badge, cardLabel, cardThumb } from '@jirum/design-system/recipes';

import { type TossDeal } from '@/shared/api/products';
import { tossProductPath } from '@/shared/config/beauty';
import { cardTrackingAttrs, type CardTrackingInput } from '@/shared/lib/card-tracking';
import { cn } from '@/shared/lib/cn';
import ProductThumbnail from '@/shared/ui/ProductThumbnail';
import ServiceLink from '@/shared/ui/ServiceLink';

/**
 * 토스 뷰티 카드 — web widgets/toss/ui/TossDealCard 를 옮겼다. 그 코너처럼 **판매가·할인율은 숨기고**
 * 상세는 `?from=toss` 로 연다(상세가 토스 유입으로 알아본다).
 */
export default function TossDealCard({
  deal,
  tracking,
}: {
  deal: TossDeal;
  tracking: Omit<CardTrackingInput, 'productId'>;
}) {
  return (
    <ServiceLink
      href={tossProductPath(deal.id)}
      className="block w-full transition-transform duration-100 active:scale-95"
      {...cardTrackingAttrs({ ...tracking, productId: deal.id })}
    >
      <div className={cn('relative aspect-square', cardThumb)}>
        <ProductThumbnail src={deal.thumbnail} alt={deal.title} sizes="140px" />
        {deal.badge && (
          <div className="bg-error-500 text-fixed-white absolute top-0 right-0 z-10 flex h-6 items-center justify-center rounded-tr-lg rounded-bl-lg px-2 text-xs font-semibold">
            {deal.badge}
          </div>
        )}
        {deal.bestSeller && (
          <div
            className={cn(
              'absolute bottom-0 left-0 z-10 flex items-center',
              cardLabel.corner.box,
              cardLabel.tone.dark.box,
              cardLabel.corner.text,
              cardLabel.tone.dark.text,
            )}
          >
            베스트판매자
          </div>
        )}
      </div>
      <span className="line-clamp-2 h-12 pt-2 text-sm wrap-break-word text-gray-700">
        {deal.title}
      </span>
      {(deal.arrivalGuaranteed || deal.specialProduct) && (
        <div className="flex flex-wrap gap-1 pt-1">
          {deal.arrivalGuaranteed && (
            <span
              className={cn(
                'inline-flex items-center whitespace-nowrap',
                badge.size.sm.box,
                badge.size.sm.text,
                badge.variant.soft.success.box,
                badge.variant.soft.success.text,
              )}
            >
              도착보장
            </span>
          )}
          {deal.specialProduct && (
            <span
              className={cn(
                'inline-flex items-center whitespace-nowrap',
                badge.size.sm.box,
                badge.size.sm.text,
                badge.variant.soft.error.box,
                badge.variant.soft.error.text,
              )}
            >
              토스특가
            </span>
          )}
        </div>
      )}
      {typeof deal.rating === 'number' && (
        <span className="block pt-1 text-xs whitespace-nowrap text-gray-500">
          <span className="text-warning-400">★</span> {deal.rating}
          {deal.reviewCount ? ` (${deal.reviewCount.toLocaleString()})` : ''}
        </span>
      )}
    </ServiceLink>
  );
}
