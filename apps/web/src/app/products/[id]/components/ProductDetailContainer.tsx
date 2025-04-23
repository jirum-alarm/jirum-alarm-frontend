import { QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import { getAccessToken } from '@/app/actions/token';
import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { ProductQueries } from '@/entities/product';

import ProductDetailLayout from './ProductDetailLayout';

export default async function ProductDetailContainer({ productId }: { productId: number }) {
  const queryClient = new QueryClient();

  const [productGuides, token] = await Promise.all([
    queryClient.fetchQuery(ProductQueries.productGuide({ productId })),
    getAccessToken(),
  ]);

  return (
    <ApiErrorBoundary>
      <Suspense>
        <ProductDetailLayout
          productId={productId}
          productGuides={productGuides.productGuides}
          isUserLogin={!!token}
        />
      </Suspense>
    </ApiErrorBoundary>
  );
}
