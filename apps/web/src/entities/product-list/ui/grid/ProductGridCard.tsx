'use client';

import { cardThumb, productCard } from '@jirum/design-system/recipes';
import { getTossTimeDeal } from '@jirum/domain/toss-time-deal';
import * as m from 'motion/react-m';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import DisplayTime from '@/shared/ui/DisplayTime';
import Link from '@/shared/ui/Link';

import {
  type ProductCardSource,
  productCardTracking,
} from '@/entities/product-list/model/card-tracking';
import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayProductSource from '@/entities/product-list/ui/card/DisplayProductSource';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';
import TossTimeDealPrice from '@/entities/product-list/ui/card/TossTimeDealPrice';
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
  // 토스 하루특가는 「2주 전」(첫 수집 시각)을 안 붙인다 — 오늘만 여는 딜이 오래된 딜처럼 읽힌다.
  const showTime = displayTime && !getTossTimeDeal(product.data);
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
          <span
            className={cn('line-clamp-2 wrap-break-word', productCard.title, productCard.titleBox)}
          >
            {product.title}
          </span>
          <DisplayProductSource
            mallName={product.mallName}
            provider={product.provider}
            postedCommunityCount={product.postedCommunityCount}
            time={showTime ? <DisplayTime time={product.postedAt} /> : undefined}
            className="pt-1"
            narrow
          />
          <TossTimeDealPrice product={product} priceClassName={productCard.price.grid} />
        </div>
      </m.div>
    </Link>
  );
}
