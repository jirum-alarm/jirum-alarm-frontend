'use client';

import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { ProductQuery } from '@/shared/api/gql/graphql';

import MoreProductsSkeleton from './MoreProductsSkeleton';
import RelatedProducts from './RelatedProducts';

export default function RelatedProductsContainer({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  return (
    <section className="px-5">
      <SectionHeader title="다른 고객이 함께 본 상품" />
      <Suspense fallback={<MoreProductsSkeleton />}>
        <RelatedProducts product={product} />
      </Suspense>
    </section>
  );
}
