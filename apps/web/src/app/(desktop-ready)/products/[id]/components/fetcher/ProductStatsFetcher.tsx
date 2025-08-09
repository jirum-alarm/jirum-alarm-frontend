import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Suspense } from 'react';

import { ProductQueries } from '@/entities/product';

export default async function ProductStatsFetcher({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.productStatsServer({ id: productId }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>{children}</Suspense>
    </HydrationBoundary>
  );
}
