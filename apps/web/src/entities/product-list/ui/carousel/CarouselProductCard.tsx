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

export default function CarouselProductCard({
  product,
  priority,
  source,
}: {
  product: ProductCardType;
  priority?: boolean;
  source?: ProductCardSource;
}) {
  // 첫 화면(priority) 카드만 상세를 통째로 미리 받는다(탭 즉시 전환). 나머지는 뷰포트 프리페치를 끈다 —
  // 상세에 loading.tsx 가 없어 auto 프리페치(레이아웃 조각 ~600B)가 아무것도 안 주는데 서버만 때렸다.
  return (
    <Link
      prefetch={!!priority}
      href={PAGE.DETAIL + '/' + product.id}
      className="pc:w-[192px] inline-block w-[120px]"
      {...productCardTracking(source, product.id)}
    >
      <m.div className="rounded-lg" whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <div className={cn('pc:h-[192px] relative aspect-square h-[120px]', cardThumb)}>
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
          <span className="line-clamp-2 h-12 w-full pt-2 text-sm break-words text-gray-700">
            {product.title}
          </span>
          <DisplayProductSource
            mallName={product.mallName}
            provider={product.provider}
            time={<DisplayTime time={product.postedAt} />}
            className="pt-1"
          />
          <div className="flex items-center pt-1">
            <DisplayListPrice price={product.price} />
          </div>
        </div>
      </m.div>
    </Link>
  );
}
