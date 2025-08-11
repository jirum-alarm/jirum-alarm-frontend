import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { ProductQueries } from '@entities/product';

const RecommendPrefetch = async ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(ProductQueries.productKeywords());

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
};

export default RecommendPrefetch;
