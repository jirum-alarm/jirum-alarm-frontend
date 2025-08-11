import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { ProductQueries } from '@entities/product';

export default async function ProductStatsPrefetch({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.productStats({ id: productId }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* children 내부에 추가 Suspense를 허용 */}
      {children}
    </HydrationBoundary>
  );
}
