import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { ProductQueries } from '@entities/product';

export default async function ProductAdditionalInfoPrefetch({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.productAdditionalInfo({ id: productId }));
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
