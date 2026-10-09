'use client';

import { cardThumb } from '@jirum/design-system/recipes';
import { m } from 'motion/react';

import { cn } from '@/shared/lib/cn';
import Badge from '@/shared/ui/common/Badge';
import Link from '@/shared/ui/Link';

import { tossDetailHref } from '@/entities/product/lib/from-toss';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';
import { CardCornerLabel } from '@/entities/product-list/ui/ProductCardStatus';

import { type TossDeal } from './mock';

// 토스 전용 카드. ProductGridCard 스타일(rounded-lg / aspect-square / gray 팔레트)을 따르되
// 토스 특가 코너에서는 판매가·할인율을 숨기고 상세는 ?from=toss 로 연다.
export default function TossDealCard({
  deal,
  rank,
  priority,
  className,
}: {
  deal: TossDeal;
  rank?: number;
  priority?: boolean;
  className?: string;
}) {
  // %특가는 가격 신호라 코너에서는 빼 둔다. '역대급특가' 같은 마케팅 뱃지는 유지.
  const label = deal.badge;

  // 토스 딜은 product 로 등록되므로 기존 상세로 가되, 코너 유입임을 쿼리에 남긴다.
  const href = deal.productId ? tossDetailHref(deal.productId) : undefined;

  const inner = (
    <m.div className="rounded-lg" whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
      <div className={cn('relative aspect-square', cardThumb)}>
        <ProductThumbnail
          src={deal.image ?? ''}
          title={deal.title}
          type="product"
          alt={deal.title}
          sizes="(max-width: 768px) 160px, 252px"
          priority={priority}
        />
        {typeof rank === 'number' && (
          <div className="text-primary-500 bg-fixed-900 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg text-sm">
            {rank}
          </div>
        )}
        {label && (
          <div className="bg-error-500 text-fixed-white absolute top-0 right-0 z-10 flex h-6 items-center justify-center rounded-tr-lg rounded-bl-lg px-2 text-xs font-semibold">
            {label}
          </div>
        )}
        {deal.bestSeller && <CardCornerLabel tone="dark">베스트판매자</CardCornerLabel>}
      </div>

      <div className="flex flex-col">
        <span className="line-clamp-2 h-12 pt-2 text-sm wrap-break-word text-gray-700">
          {deal.title}
        </span>

        {/* 신뢰 배지: 가격 신호(최저가 보상)는 빼고 배송·토스특가만. */}
        {(deal.arrivalGuaranteed || deal.specialProduct) && (
          <div className="flex flex-wrap gap-1 pt-1">
            {deal.arrivalGuaranteed && <Badge tone="success">도착보장</Badge>}
            {deal.specialProduct && <Badge tone="error">토스특가</Badge>}
          </div>
        )}

        {/* 좁은 카드에서 '무료배송'이 글자 단위로 쪼개지던 것 방지 — 각 조각 nowrap, 넘치면 배송만 줄내림 */}
        <div className="flex flex-wrap items-center gap-x-1.5 pt-1 text-xs text-gray-500">
          {typeof deal.rating === 'number' && (
            <span className="whitespace-nowrap">
              <span className="text-warning-400">★</span> {deal.rating}
              {deal.reviewCount ? ` (${deal.reviewCount.toLocaleString()})` : ''}
            </span>
          )}
          {deal.delivery && (
            <span className="whitespace-nowrap text-gray-400">· {deal.delivery}</span>
          )}
        </div>
      </div>
    </m.div>
  );

  return href ? (
    <Link prefetch={!!priority} href={href} className={cn('w-full', className)}>
      {inner}
    </Link>
  ) : (
    <div className={cn('w-full', className)}>{inner}</div>
  );
}
