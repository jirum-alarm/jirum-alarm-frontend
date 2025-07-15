import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import HorizontalProductListSkeleton from '@/features/products/components/skeleton/HorizontalProductListSkeleton';
import { ProductQuery } from '@/shared/api/gql/graphql';

import PopularProducts from './PopularProducts';

export default function PopularProductsContainer({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  return (
    <section>
      <SectionHeader
        shouldShowMobileUI={true}
        title={`‘${product.categoryName || '기타'}’에서 인기있는 상품`}
      />
      <Suspense fallback={<HorizontalProductListSkeleton />}>
        <PopularProducts product={product} />
      </Suspense>
    </section>
  );
}
