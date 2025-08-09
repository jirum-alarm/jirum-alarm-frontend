'use client';

import { EVENT } from '@/constants/mixpanel';
import { QueryProductsQuery } from '@/shared/api/gql/graphql';

import ProductGridCard from './ProductGridCard';

type ProductGridListProps = {
  products: QueryProductsQuery['products'];
  rankFrom?: number;
  loggingPage: keyof typeof EVENT.PAGE;
};

export default function ProductGridList({ products, rankFrom, loggingPage }: ProductGridListProps) {
  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 sm:grid-cols-3">
      {products.map((product, index) => (
        <ProductGridCard
          key={product.id}
          product={product}
          rank={rankFrom ? rankFrom + index : undefined}
          logging={{ page: loggingPage }}
        />
      ))}
    </div>
  );
}
