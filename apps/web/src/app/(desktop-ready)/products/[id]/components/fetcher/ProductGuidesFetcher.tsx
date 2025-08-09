import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';

export default async function ProductGuidesFetcher({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(ProductQueries.productGuideServer({ productId }));

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
