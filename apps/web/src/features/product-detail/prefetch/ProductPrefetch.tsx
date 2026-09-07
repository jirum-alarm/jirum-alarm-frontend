import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

import { getQueryClient } from '@/app/(app)/react-query/query-client';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';
import type { ProductService } from '@/shared/api/product/product.service';

import { AdvertisementQueries } from '@/entities/advertisement/api';
import { ProductQueries } from '@/entities/product';

/** page.tsx 가 SEO 용으로 이미 받은 응답. 있으면 캐시에 심고 다시 부르지 않는다. */
type InitialData = {
  product?: Awaited<ReturnType<typeof ProductService.getProductInfo>> | null;
  productGuides?: Awaited<ReturnType<typeof ProductService.getProductGuides>> | null;
  additionalInfo?: Awaited<ReturnType<typeof ProductService.getProductAdditionalInfo>> | null;
};

export default async function ProductPrefetch({
  productId,
  initial,
  children,
}: {
  productId: number;
  initial?: InitialData;
  children: React.ReactNode;
}) {
  const queryClient = getQueryClient();

  // 예전엔 page.tsx(React.cache) 와 여기(prefetchQuery) 가 같은 3개를 각각 불러 요청당 GraphQL 3건이 중복됐다.
  const infoQuery = ProductQueries.productInfo({ id: productId });
  const guideQuery = ProductQueries.productGuide({ productId });
  const additionalQuery = ProductQueries.productAdditionalInfo({ id: productId });
  if (initial?.product) queryClient.setQueryData(infoQuery.queryKey, initial.product);
  if (initial?.productGuides) queryClient.setQueryData(guideQuery.queryKey, initial.productGuides);
  if (initial?.additionalInfo) {
    queryClient.setQueryData(additionalQuery.queryKey, initial.additionalInfo);
  }

  await Promise.all([
    initial?.product ? null : queryClient.prefetchQuery(infoQuery),
    initial?.productGuides ? null : queryClient.prefetchQuery(guideQuery),
    initial?.additionalInfo ? null : queryClient.prefetchQuery(additionalQuery),
    queryClient.prefetchQuery(ProductQueries.productStats({ id: productId })),
    // 커뮤니티 반응(첫 화면 안, 가이드 바로 아래)이 이것만 서버에서 안 받아 Suspense 경계가
    // 미완성으로 남았다 → "없다가 생김". 프리페치하면 첫 HTML 에 박힌다.
    queryClient.prefetchQuery(ProductQueries.reactionKeywords({ id: productId })),
    // 가격 이력 차트(PriceHistorySection)가 쓰는 730일. 안 받아두면 하이드레이션 뒤에 클라이언트가
    // 다시 부른다(Slow 4G 실측 8.2s).
    queryClient.prefetchQuery(ProductQueries.priceHistory({ id: productId, days: 730 })),
    queryClient.fetchQuery(
      AdvertisementQueries.activeAds({
        slotLocation: AdvertiseSlotLocation.ProductMainBanner,
      }),
    ),
  ]);

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}
