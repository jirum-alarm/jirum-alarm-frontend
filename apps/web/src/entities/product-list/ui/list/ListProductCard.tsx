'use client';

import { motion } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { formatDateToMMD } from '@/shared/lib/utils/date';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import Link from '@/shared/ui/Link';

import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

export default function ListProductCard({ product }: { product: ProductCardType }) {
  return (
    <Link href={PAGE.DETAIL + '/' + product.id}>
      <motion.div className="rounded-lg" whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <div className="flex items-center gap-4">
          <div className="pc:h-25 pc:w-25 border-border-default bg-surface-subtle relative h-19 w-19 shrink-0 overflow-hidden rounded-lg border">
            <ProductThumbnail
              src={product?.thumbnail ?? ''}
              title={product.title}
              categoryId={product.categoryId}
              type="product"
              alt={product.title}
              sizes="120px"
            />
            {product.isEnd && (
              <div className="text-semibold bg-surface-default text-fg-secondary-strong absolute bottom-0 left-0 flex h-[22px] items-center rounded-tr-lg rounded-bl-lg px-2 text-xs">
                판매종료
              </div>
            )}
            {product.earliestExpiryDate && (
              <div className="text-semibold text-fg-inverse bg-surface-inverse-subtle/80 absolute inset-x-0 bottom-0 flex h-[22px] items-center justify-center rounded-b-lg px-2 text-xs">
                유통기한 {formatDateToMMD(product.earliestExpiryDate)}
              </div>
            )}
          </div>
          <div className="flex h-full flex-col justify-between gap-1">
            <span className="text-fg-secondary-strong line-clamp-2 text-sm break-all">
              {product.title}
            </span>
            <div className="flex items-center gap-2">
              <DisplayListPrice price={product.price} widthType="wide" />
              {product.hotDealType && !product.isEnd && (
                <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
