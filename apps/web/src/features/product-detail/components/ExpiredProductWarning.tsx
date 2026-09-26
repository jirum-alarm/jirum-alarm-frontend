'use client';

import { useSuspenseQueries } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Suspense } from 'react';

import { OrderOptionType, ProductInfoFragment, ProductOrderType } from '@/shared/api/gql/graphql';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';
import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';

import { ProductQueries } from '@/entities/product';
import { ProductGridList } from '@/entities/product-list/ui/grid';

interface Props {
  product: ProductInfoFragment;
  isMobile: boolean;
}

export default function ExpiredProductWarning({ product, isMobile }: Props) {
  const isExpired = dayjs().diff(dayjs(product.postedAt), 'day') >= 7;

  if (!isExpired) return null;

  return (
    <Suspense>
      <ExpiredProductRecommendations product={product} isMobile={isMobile} />
    </Suspense>
  );
}

function ExpiredProductRecommendations({
  product,
  isMobile,
}: {
  product: ProductInfoFragment;
  isMobile: boolean;
}) {
  const keyword =
    product.title
      .replace(/^\[.*?\]\s*/, '')
      .split('(')[0]
      .trim() || product.title;

  // Mobile: Fetch 10, Show 9. If 10 received -> Show More.
  // PC: Fetch 9, Show 8. If 9 received -> Show More.
  const fetchLimit = isMobile ? 10 : 9;
  const displayLimit = isMobile ? 9 : 8;

  const currentProductId = Number(product.id);
  const [{ data: sameData }, { data }] = useSuspenseQueries({
    queries: [
      ProductQueries.sameProductDeals({ id: currentProductId }),
      ProductQueries.products({
        keyword,
        limit: fetchLimit,
        orderBy: ProductOrderType.Id,
        orderOption: OrderOptionType.Desc,
      }),
    ],
  });

  // 동일상품 그룹(어느 멤버 상세든 같은 목록) 먼저, 모자라면 제목 키워드의 더 최신 글로 채운다.
  const similarProducts = Array.from(
    new Map(
      [
        ...(sameData.sameProductDeals ?? []).filter((p) => Number(p.id) !== currentProductId),
        ...(data.products ?? []).filter((p) => Number(p.id) > currentProductId),
      ].map((p) => [p.id, p]),
    ).values(),
  );

  const displayProducts = similarProducts.slice(0, displayLimit);
  const hasMore = similarProducts.length >= fetchLimit;

  if (displayProducts.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="pc:space-y-4 pc:px-0 space-y-3 px-4">
        <DetailSectionHeader
          className="px-1"
          title="최신 핫딜을 확인해 보세요"
          subtitle="이 상품은 올라온 지 며칠 지나 품절·종료됐을 수 있어요"
          right={
            hasMore ? (
              <InteractiveMoreLink
                href={`/products/${product.id}/related`}
                className="text-xs font-medium text-gray-400 hover:text-gray-600"
              >
                더보기
              </InteractiveMoreLink>
            ) : null
          }
        />
        <ProductGridList
          products={displayProducts}
          className="pc:grid-cols-4 pc:gap-3 grid-cols-3 gap-1.5 sm:grid-cols-3"
          cardClassName="p-0"
          displayTime={true}
        />
      </div>
    </div>
  );
}
