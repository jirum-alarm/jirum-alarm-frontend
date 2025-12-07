'use client';

import { EVENT } from '@shared/config/mixpanel';
import { cn } from '@shared/lib/cn';

import { GridProductCard, type ProductCardType } from '@entities/product';

type ProductGridListProps = {
  products: ProductCardType[];
  rankFrom?: number;
  className?: string;
  displayTime?: boolean;
  logging?: { page: keyof typeof EVENT.PAGE };
};

export default function ProductGridList({
  products,
  rankFrom,
  className,
  displayTime = true,
}: ProductGridListProps) {
  return (
    <div
      className={cn(
        'pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3',
        className,
      )}
    >
      {products.map((product, index) => (
        <GridProductCard
          key={product.id}
          product={product}
          rank={rankFrom ? rankFrom + index : undefined}
          displayTime={displayTime}
        />
      ))}
    </div>
  );
}
