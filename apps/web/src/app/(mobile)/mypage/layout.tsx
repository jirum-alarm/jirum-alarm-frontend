import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { AuthQueries } from '@/entities/auth';

import MyPageShell from '@/features/mypage/ui/MyPageShell';

export default async function MyPageLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(AuthQueries.me());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MyPageShell>{children}</MyPageShell>
    </HydrationBoundary>
  );
}
