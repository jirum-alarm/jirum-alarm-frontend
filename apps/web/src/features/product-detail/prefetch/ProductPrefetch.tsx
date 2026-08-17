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
    // 커뮤니티 반응(첫 화면 안, 가이드 바로 아래)이 이것만 서버에서 안 받아 Suspense 경계가
    // 미완성으로 남았다 → "없다가 생김". 프리페치하면 첫 HTML 에 박힌다.
    queryClient.prefetchQuery(ProductQueries.reactionKeywords({ id: productId })),
    queryClient.fetchQuery(
      AdvertisementQueries.activeAds({
        slotLocation: AdvertiseSlotLocation.ProductMainBanner,
      }),
    ),
  ]);

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
