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
          <div className="pc:h-25 pc:w-25 relative h-19 w-19 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <ProductThumbnail
              src={product?.thumbnail ?? ''}
              title={product.title}
              categoryId={product.categoryId}
              type="product"
              alt={product.title}
              sizes="120px"
            />
            {product.isEnd && (
              <div className="text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-tr-lg rounded-bl-lg bg-white px-2 text-xs text-gray-700">
                판매종료
              </div>
            )}
            {product.earliestExpiryDate && (
              <div className="text-semibold absolute inset-x-0 bottom-0 flex h-[22px] items-center justify-center rounded-b-lg bg-gray-700/80 px-2 text-xs text-white">
                유통기한 {formatDateToMMD(product.earliestExpiryDate)}
              </div>
            )}
          </div>
          <div className="flex h-full flex-col justify-between gap-1">
            <span className="line-clamp-2 text-sm break-all text-gray-700">{product.title}</span>
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
