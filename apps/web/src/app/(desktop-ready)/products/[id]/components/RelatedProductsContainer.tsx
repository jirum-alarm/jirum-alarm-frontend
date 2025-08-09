import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import HorizontalProductListSkeleton from '@/features/products/components/skeleton/HorizontalProductListSkeleton';

import RelatedProducts from './RelatedProducts';

export default function RelatedProductsContainer({ productId }: { productId: number }) {
  return (
    <section>
      <SectionHeader shouldShowMobileUI={true} title="다른 고객이 함께 본 상품" />
      <Suspense fallback={<HorizontalProductListSkeleton />}>
        <RelatedProducts productId={productId} />
      </Suspense>
    </section>
  );
}
