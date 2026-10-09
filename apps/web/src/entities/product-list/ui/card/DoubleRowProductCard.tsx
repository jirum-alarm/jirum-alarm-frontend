'use client';

import { cardThumb } from '@jirum/design-system/recipes';
import { m } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import HotdealBadge from '@/shared/ui/HotdealBadge';
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

export default function DoubleRowProductCard({
  product,
  source,
}: {
  product: ProductCardType;
  source?: ProductCardSource;
}) {
  return (
    <Link
      prefetch={false}
      href={PAGE.DETAIL + '/' + product.id}
      {...productCardTracking(source, product.id)}
    >
      <m.div className="rounded-lg" whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <div className="flex w-full flex-row items-start gap-2">
          <div className={cn('relative h-[120px] w-[120px] shrink-0', cardThumb)}>
            <ProductThumbnail
              src={product?.thumbnail ?? ''}
              title={product.title}
              categoryId={product.categoryId}
              type="product"
              alt={product.title}
              sizes="120px"
            />
            <ProductCardStatus product={product} showHotdealBadge={false} />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <span className="line-clamp-2 text-sm font-normal break-all text-gray-800">
              {product.title}
            </span>
            <DisplayProductSource mallName={product.mallName} provider={product.provider} />
            <div className="mt-auto flex items-center gap-2">
              <DisplayListPrice price={product.price} widthType="wide" />
              {product.hotDealType && !product.isEnd && (
                <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
              )}
            </div>
          </div>
        </div>
      </m.div>
    </Link>
  );
}
