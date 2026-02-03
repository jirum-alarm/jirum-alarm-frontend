'use client';

import { motion } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import DisplayTime from '@/shared/ui/DisplayTime';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import Link from '@/shared/ui/Link';

import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

export default function ProductGridCard({
  product,
  rank,
  actionIcon,
  displayTime = true,
  priority,
  className,
}: {
  product: ProductCardType;
  rank?: number;
  actionIcon?: React.ReactNode;
  displayTime?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link href={PAGE.DETAIL + '/' + product.id} className="w-full">
      <motion.div
        className={cn('rounded-lg p-2', className)}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
      >
        <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
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
            <div className="text-primary-500 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-900 text-sm">
              {rank}
            </div>
          )}
          {product.isEnd ? (
            <div className="text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-tr-lg rounded-bl-lg bg-white px-2 text-xs text-gray-700">
              판매종료
            </div>
          ) : (
            product.hotDealType && (
              <div className="absolute bottom-0 left-0 z-10">
                <HotdealBadge badgeVariant="card" hotdealType={product.hotDealType} />
              </div>
            )
          )}
        </div>
        <div className="flex flex-col">
          <span className="line-clamp-2 h-12 pt-2 text-sm wrap-break-word text-gray-700">
            {product.title}
          </span>
          <div className="flex h-9 items-center pt-1">
            <DisplayListPrice price={product.price} />
            {displayTime && (
              <>
                <span className="w-2"></span>
                <span className="text-sm text-gray-600">
                  <DisplayTime time={product.postedAt} />
                </span>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
