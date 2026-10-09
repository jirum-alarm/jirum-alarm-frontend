'use client';

import { cardThumb } from '@jirum/design-system/recipes';
import { m } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import DisplayTime from '@/shared/ui/DisplayTime';
import Link from '@/shared/ui/Link';

import {
  type ProductCardSource,
  productCardTracking,
} from '@/entities/product-list/model/card-tracking';
import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import DisplayProductSource from '@/entities/product-list/ui/card/DisplayProductSource';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';
import { ProductCardStatus } from '@/entities/product-list/ui/ProductCardStatus';

export default function ProductGridCard({
  product,
  rank,
  actionIcon,
  displayTime = true,
  priority,
  className,
  onCardClick,
  cardRef,
  source,
}: {
  product: ProductCardType;
  rank?: number;
  actionIcon?: React.ReactNode;
  displayTime?: boolean;
  priority?: boolean;
  className?: string;
  // 노출/클릭 추적용 opt-in. 미지정 시 기존 동작과 동일.
  onCardClick?: () => void;
  cardRef?: React.Ref<HTMLAnchorElement>;
  // GTM 진입경로 추적용. 미지정 시 data 속성 미부착(추적 안 함).
  source?: ProductCardSource;
}) {
  // 첫 화면(priority) 카드만 상세를 통째로 미리 받는다(탭 즉시 전환). 나머지는 뷰포트 프리페치를 끈다 —
  // 상세에 loading.tsx 가 없어 auto 프리페치(레이아웃 조각 ~600B)가 아무것도 안 주는데 서버만 때렸다.
  return (
    <Link
      prefetch={!!priority}
      href={PAGE.DETAIL + '/' + product.id}
      className="w-full"
      ref={cardRef}
      onClick={onCardClick}
      {...productCardTracking(source, product.id, rank)}
    >
      <m.div
        className={cn('rounded-lg', className)}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <div className={cn('relative aspect-square', cardThumb)}>
          {actionIcon && <div className="absolute top-0 right-0 z-10">{actionIcon}</div>}
          <ProductThumbnail
            src={product?.thumbnail ?? ''}
            title={product.title}
            categoryId={product.categoryId}
            type="product"
            alt={product.title}
            sizes="(max-width: 768px) 160px, 252px"
            priority={priority}
          />
          {typeof rank === 'number' && (
            <div className="text-primary-500 bg-fixed-900 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg text-sm">
              {rank}
            </div>
          )}
          <ProductCardStatus product={product} />
        </div>
        <div className="flex flex-col">
          <span className="line-clamp-2 h-12 pt-2 text-sm wrap-break-word text-gray-700">
            {product.title}
          </span>
          <DisplayProductSource
            mallName={product.mallName}
            provider={product.provider}
            time={displayTime ? <DisplayTime time={product.postedAt} /> : undefined}
            className="pt-1"
          />
          <div className="flex items-center gap-1.5 pt-1">
            <div className="min-w-0 flex-1 overflow-hidden">
              <DisplayListPrice price={product.price} className="text-base" />
            </div>
          </div>
        </div>
      </m.div>
    </Link>
  );
}
