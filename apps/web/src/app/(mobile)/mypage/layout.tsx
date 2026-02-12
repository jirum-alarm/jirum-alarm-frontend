import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { AuthQueries } from '@/entities/auth';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(AuthQueries.me());
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
