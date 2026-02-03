'use client';

import { motion } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import Link from '@/shared/ui/Link';

import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

export default function ListProductCard({ product }: { product: ProductCardType }) {
  return (
    <Link href={PAGE.DETAIL + '/' + product.id} className="w-full">
      <motion.div className="rounded-lg" whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
        <div className="flex items-center gap-4">
          <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <ProductThumbnail
              src={product?.thumbnail ?? ''}
              title={product.title}
              categoryId={product.categoryId}
              type="product"
              alt={product.title}
              sizes="100px"
            />
            {product.isEnd && (
              <div className="text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-tr-lg rounded-bl-lg bg-white px-2 text-xs text-gray-700">
                판매종료
              </div>
            )}
          </div>
          <div className="flex h-full flex-col justify-between gap-1">
            {product.hotDealType && !product.isEnd && (
              <div className="mb-1">
                <HotdealBadge badgeVariant="card" hotdealType={product.hotDealType} />
              </div>
            )}
            <span className="line-clamp-2 text-sm break-all text-gray-700">{product.title}</span>
            <div className="flex items-center">
              <DisplayListPrice price={product.price} />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
