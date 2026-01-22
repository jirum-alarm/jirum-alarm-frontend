'use client';

import { EVENT } from '@/constants/mixpanel';
import { cn } from '@/lib/cn';

import { type ProductCardType } from '../type';

import ProductGridCard from './GridProductCard';

type ProductGridListProps = {
  products: ProductCardType[];
  rankFrom?: number;
  className?: string;
  cardClassName?: string;
  displayTime?: boolean;
  logging?: { page: keyof typeof EVENT.PAGE };
  priorityCount?: number;
};

export default function ProductGridList({
  products,
  rankFrom,
  className,
  cardClassName,
  displayTime = true,
  logging,
  priorityCount = 0,
}: ProductGridListProps) {
  return (
    <div
      className={cn(
        'pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3',
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductGridCard
          key={product.id}
          product={product}
          rank={rankFrom ? rankFrom + index : undefined}
          displayTime={displayTime}
          priority={index < priorityCount}
          className={cardClassName}
        />
      ))}
    </div>
  );
}
