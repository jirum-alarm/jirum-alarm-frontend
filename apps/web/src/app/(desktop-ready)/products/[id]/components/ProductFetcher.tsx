import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import { ProductQueries } from '@/entities/product';
import { ProductQuery } from '@/shared/api/gql/graphql';

type Product = NonNullable<ProductQuery['product']>;

export default async function ProductFetcher({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.product({ id: productId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ProductLoadingFallback />}>{children}</Suspense>
    </HydrationBoundary>
  );
}

function ProductLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="mt-2 text-gray-600">상품 정보를 불러오는 중...</p>
      </div>
    </div>
  );
}
