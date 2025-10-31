import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import { ProductQueries } from '@entities/product';

export default async function ProductPrefetch({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  const prefetchPromises = [
    queryClient.prefetchQuery(ProductQueries.productInfo({ id: productId })),
    queryClient.prefetchQuery(ProductQueries.productStats({ id: productId })),
    queryClient.prefetchQuery(ProductQueries.productAdditionalInfo({ id: productId })),
    queryClient.prefetchQuery(ProductQueries.productGuide({ productId })),
  ];

  await Promise.all(prefetchPromises);

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
