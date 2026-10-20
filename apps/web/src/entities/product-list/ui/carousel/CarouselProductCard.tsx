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

export default function CarouselProductCard({
  product,
  priority,
  source,
}: {
  product: ProductCardType;
  priority?: boolean;
  source?: ProductCardSource;
}) {
  // 토스 하루특가는 「2주 전」(첫 수집 시각)을 안 붙인다 — 오늘만 여는 딜이 오래된 딜처럼 읽힌다.
  const isTimeDeal = getTossTimeDeal(product.data) != null;
  // 첫 화면(priority) 카드만 상세를 통째로 미리 받는다(탭 즉시 전환). 나머지는 뷰포트 프리페치를 끈다 —
  // 상세에 loading.tsx 가 없어 auto 프리페치(레이아웃 조각 ~600B)가 아무것도 안 주는데 서버만 때렸다.
  return (
    <Link
      prefetch={!!priority}
      href={PAGE.DETAIL + '/' + product.id}
      className="pc:w-48 inline-block w-[120px]"
      {...productCardTracking(source, product.id)}
    >
      <m.div className="rounded-lg" whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <div className={cn('pc:h-48 relative aspect-square h-[120px]', cardThumb)}>
          <ProductThumbnail
            src={product?.thumbnail ?? ''}
            title={product.title}
            categoryId={product.categoryId}
            type="hotDeal"
            alt={product.title}
            sizes="(max-width: 768px) 120px, 192px"
            priority={priority}
          />
          <ProductCardStatus product={product} />
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              'line-clamp-2 w-full break-words',
              productCard.title,
              productCard.titleBox,
            )}
          >
            {product.title}
          </span>
          <DisplayProductSource
            mallName={product.mallName}
            provider={product.provider}
            postedCommunityCount={product.postedCommunityCount}
            time={isTimeDeal ? undefined : <DisplayTime time={product.postedAt} />}
            className="pt-1"
            narrow
          />
          <TossTimeDealPrice product={product} />
        </div>
      </m.div>
    </Link>
  );
}
