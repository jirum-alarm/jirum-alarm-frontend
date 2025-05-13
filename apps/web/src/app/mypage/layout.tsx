import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { AuthQueries } from '@/entities/auth';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(AuthQueries.meServer(cookieHeader));
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
