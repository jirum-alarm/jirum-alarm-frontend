import { AuthQueriesServer } from '@/entities/auth';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(AuthQueriesServer.me());
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
