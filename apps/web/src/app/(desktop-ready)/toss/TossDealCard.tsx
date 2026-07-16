'use client';

import { motion } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import Link from '@/shared/ui/Link';

import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

import { type TossDeal } from './mock';

// 토스 전용 카드. ProductGridCard 스타일(rounded-lg / aspect-square / gray 팔레트)을 따르되
// 토스가 주는 정보(할인율·30일최저가·평점·리뷰·배송·베스트판매자·마케팅뱃지)를 모두 노출.
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
  const label = deal.badge ?? (deal.discountRate ? `${deal.discountRate}% 특가` : undefined);

  // 토스 딜은 product 로 등록되므로 기존 상세(/products/{id})로 간다.
  // 목업엔 productId 가 없어 클릭 비활성(백엔드 등록되면 자동 연결).
  const href = deal.productId ? `${PAGE.DETAIL}/${deal.productId}` : undefined;

  const inner = (
    <motion.div className="rounded-lg" whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
      <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        <ProductThumbnail
          src={deal.image ?? ''}
          title={deal.title}
          type="product"
          alt={deal.title}
          sizes="(max-width: 768px) 160px, 252px"
          priority={priority}
        />
        {typeof rank === 'number' && (
          <div className="text-primary-500 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-900 text-sm">
            {rank}
          </div>
        )}
        {label && (
          <div className="bg-error-500 absolute top-0 right-0 z-10 flex h-6 items-center justify-center rounded-tr-[8px] rounded-bl-[8px] px-2 text-xs font-semibold text-white">
            {label}
          </div>
        )}
        {deal.bestSeller && (
          <div className="absolute bottom-0 left-0 z-10 flex h-[22px] items-center rounded-tr-lg rounded-bl-lg bg-gray-900/80 px-2 text-xs font-medium text-white">
            베스트판매자
          </div>
        )}
      </div>

      <div className="flex flex-col">
        <span className="line-clamp-2 h-12 pt-2 text-sm wrap-break-word text-gray-700">
          {deal.title}
        </span>

        {/* 홈은 3열이라 카드폭 ~104px. 가격+배지가 한 줄에 안 들어가면 '15,900원'의 '원'까지
            쪼개져 세로로 깨졌다(줄바꿈 버그). 각 조각은 nowrap로 안 쪼개고, 좁으면 배지만 줄내림. */}
        <div className="flex flex-wrap items-baseline gap-x-1.5 pt-1">
          <span className="text-lg font-semibold whitespace-nowrap text-gray-900">
            {deal.price.toLocaleString()}원
          </span>
          {deal.lowestIn30Days && (
            <span className="text-error-500 text-xs font-bold whitespace-nowrap">30일 최저가</span>
          )}
        </div>

        {deal.unitPrice && <span className="text-xs text-gray-500">{deal.unitPrice}</span>}

        {/* 좁은 카드에서 '무료배송'이 글자 단위로 쪼개지던 것 방지 — 각 조각 nowrap, 넘치면 배송만 줄내림 */}
        <div className="flex flex-wrap items-center gap-x-1.5 pt-1 text-xs text-gray-500">
          {typeof deal.rating === 'number' && (
            <span className="whitespace-nowrap">
              <span className="text-[#ffb200]">★</span> {deal.rating}
              {deal.reviewCount ? ` (${deal.reviewCount.toLocaleString()})` : ''}
            </span>
          )}
          {deal.delivery && (
            <span className="whitespace-nowrap text-gray-400">· {deal.delivery}</span>
          )}
        </div>
      </div>
    </motion.div>
  );

  return href ? (
    <Link href={href} className={cn('w-full', className)}>
      {inner}
    </Link>
  ) : (
    <div className={cn('w-full', className)}>{inner}</div>
  );
}
