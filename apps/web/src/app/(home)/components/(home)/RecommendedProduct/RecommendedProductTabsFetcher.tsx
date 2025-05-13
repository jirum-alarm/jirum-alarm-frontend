import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { PropsWithChildren } from 'react';

import { ProductQueries } from '@/entities/product';

const RecommendedProductTabsFetcher = async ({ children }: PropsWithChildren) => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.productKeywordsServer(cookieHeader));
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
};

export default RecommendedProductTabsFetcher;
