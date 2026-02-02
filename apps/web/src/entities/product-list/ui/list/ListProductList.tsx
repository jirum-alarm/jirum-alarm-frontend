'use client';

import { type ProductCardType } from '@/entities/product-list/model/types';

import { cn } from '@/shared/lib/cn';


import ListProductCard from './ListProductCard';

type ListProductListProps = {
  products: ProductCardType[];
  className?: string;
};

export default function ListProductList({ products, className }: ListProductListProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {products.map((product) => (
        <ListProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
