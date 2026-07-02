'use client';

import { cn } from '@/shared/lib/cn';

import { type ProductCardSource } from '@/entities/product-list/model/card-tracking';
import { type ProductCardType } from '@/entities/product-list/model/types';

import ListProductCard from './ListProductCard';

type ListProductListProps = {
  products: ProductCardType[];
  className?: string;
  source?: ProductCardSource;
};

export default function ListProductList({ products, className, source }: ListProductListProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {products.slice(0, 4).map((product) => (
        <ListProductCard key={product.id} product={product} source={source} />
      ))}
    </div>
  );
}
