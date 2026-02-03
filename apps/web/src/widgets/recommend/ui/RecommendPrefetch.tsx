import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import { ProductQueries } from '@/entities/product';

const RecommendPrefetch = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery(ProductQueries.productKeywords());

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
};

export default RecommendPrefetch;
