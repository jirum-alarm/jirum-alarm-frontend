import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';

import { AdvertisementQueries } from '@/entities/advertisement/api';
import { ProductQueries } from '@/entities/product';

export default async function ProductPrefetch({
  productId,
  children,
}: {
  productId: number;
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(ProductQueries.productInfo({ id: productId })),
    queryClient.prefetchQuery(ProductQueries.productStats({ id: productId })),
    queryClient.prefetchQuery(ProductQueries.productAdditionalInfo({ id: productId })),
    queryClient.prefetchQuery(ProductQueries.productGuide({ productId })),
    queryClient.fetchQuery(
      AdvertisementQueries.activeAds({
        slotLocation: AdvertiseSlotLocation.ProductMainBanner,
      }),
    ),
  ]);

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
