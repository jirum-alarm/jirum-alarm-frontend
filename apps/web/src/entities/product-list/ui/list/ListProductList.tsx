'use client';

import { cn } from '@/shared/lib/cn';

import { type ProductCardSource } from '@/entities/product-list/model/card-tracking';
import { type ProductCardType } from '@/entities/product-list/model/types';

import ListProductCard from './ListProductCard';

type ListProductListProps = {
  products: ProductCardType[];
  className?: string;
  source?: ProductCardSource;
  /** 앞에서 몇 장을 첫 화면 카드로 볼지. 홈 첫 섹션이 4 를 넘기는데 여기서 버려지고 있었다. */
  priorityCount?: number;
};

export default function ListProductList({
  products,
  className,
  source,
  priorityCount = 0,
}: ListProductListProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {products.slice(0, 4).map((product, index) => (
        <ListProductCard
          key={product.id}
          product={product}
          source={source}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
