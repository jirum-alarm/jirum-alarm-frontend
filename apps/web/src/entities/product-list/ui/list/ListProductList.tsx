'use client';

import { cn } from '@/shared/lib/cn';

import { type ProductCardType } from '@/entities/product-list/model/types';

import ListProductCard from './ListProductCard';

type ListProductListProps = {
  products: ProductCardType[];
  className?: string;
};

export default function ListProductList({ products, className }: ListProductListProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {products.slice(0, 4).map((product) => (
        <ListProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
