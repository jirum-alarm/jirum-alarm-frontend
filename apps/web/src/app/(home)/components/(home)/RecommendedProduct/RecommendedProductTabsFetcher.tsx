import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ProductQueries } from '@/entities/product';
import { PropsWithChildren } from 'react';

const RecommendedProductTabsFetcher = async ({ children }: PropsWithChildren) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.productKeywords());
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
};

export default RecommendedProductTabsFetcher;
