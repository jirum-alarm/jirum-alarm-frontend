import { Suspense } from 'react';

import { getAccessToken } from '@/app/actions/token';
import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { ProductGuidesQuery } from '@/shared/api/gql/graphql';

import ProductDetailLayout from './ProductDetailLayout';

type ProductGuides = ProductGuidesQuery['productGuides'];

export default async function ProductDetailContainer({
  productId,
  productGuides,
}: {
  productId: number;
  productGuides: ProductGuides;
}) {
  const token = await getAccessToken();

  return (
    <ApiErrorBoundary>
      <Suspense>
        <ProductDetailLayout
          productId={productId}
          productGuides={productGuides}
          isUserLogin={!!token}
        />
      </Suspense>
    </ApiErrorBoundary>
  );
}
