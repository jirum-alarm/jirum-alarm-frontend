'use client';

import { ProductQueries } from '@/entities/product';
import { useSuspenseQuery } from '@tanstack/react-query';


import CategoryPopularSection from './CategoryPopularSection';

type Props = {
  productId: number;
  limit?: number;
};

export default function CategoryPopularByProductSection({ productId, limit = 20 }: Props) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const categoryId = product?.categoryId ?? 0;
  const categoryName = product?.categoryName ?? '기타';

  return (
    <CategoryPopularSection categoryId={categoryId} categoryName={categoryName} limit={limit} />
  );
}
