import { IProduct } from '@/graphql/interface';
import React from 'react';
import { ProductImageCard, useCollectProduct } from '@/features/products';

export default function ProductList({ products }: { products: IProduct[] }) {
  const collectProduct = useCollectProduct();

  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
      {products.map((product, i) => (
        <ProductImageCard
          key={i}
          product={product}
          collectProduct={collectProduct}
          logging={{ page: 'SEARCH_RESULT' }}
        />
      ))}
    </div>
  );
}
