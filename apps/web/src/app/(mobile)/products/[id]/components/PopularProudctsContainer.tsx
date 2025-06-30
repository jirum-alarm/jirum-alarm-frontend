import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { ProductQuery } from '@/shared/api/gql/graphql';

import MoreProductsSkeleton from './MoreProductsSkeleton';
import PopularProducts from './PopularProducts';

export default function PopularProductsContainer({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  return (
    <section className="px-5">
      <SectionHeader title={`‘${product.categoryName || '기타'}’에서 인기있는 상품`} />
      <Suspense fallback={<MoreProductsSkeleton />}>
        <PopularProducts product={product} />
      </Suspense>
    </section>
  );
}
