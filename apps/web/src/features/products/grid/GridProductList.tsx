'use client';

import { EVENT } from '@/constants/mixpanel';

import { type ProductCardType } from '../type';

import ProductGridCard from './GridProductCard';

type ProductGridListProps = {
  products: ProductCardType[];
  rankFrom?: number;
  logging?: { page: keyof typeof EVENT.PAGE };
  priorityCount?: number;
};

export default function ProductGridList({
  products,
  rankFrom,
  logging,
  priorityCount = 0,
}: ProductGridListProps) {
  return (
    <div className="pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
      {products.map((product, index) => (
        <ProductGridCard
          key={product.id}
          product={product}
          rank={rankFrom ? rankFrom + index : undefined}
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
