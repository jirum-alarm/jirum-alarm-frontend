'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

import { OrderOptionType, ProductInfoFragment, ProductOrderType } from '@/shared/api/gql/graphql';
import { useDevice } from '@/shared/hooks/useDevice';
import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

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

  const { data } = useSuspenseQuery(
    ProductQueries.products({
      keyword,
      limit: fetchLimit,
      orderBy: ProductOrderType.Id,
      orderOption: OrderOptionType.Desc,
    }),
  );

  const currentProductId = Number(product.id);
  const similarProducts = Array.from(
    new Map(
      (data.products ?? []).filter((p) => Number(p.id) > currentProductId).map((p) => [p.id, p]),
    ).values(),
  );

  const displayProducts = similarProducts.slice(0, displayLimit);
  const hasMore = similarProducts.length >= fetchLimit;

  if (displayProducts.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="mb-6 flex h-11 w-full items-center justify-center bg-gray-100 text-sm font-medium text-gray-800">
        이 상품 판매종료 되었을 수 있어요!
      </div>

      <div className="pc:space-y-4 pc:px-0 space-y-2 px-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="pc:text-lg text-lg font-bold text-gray-900">이런 상품은 어때요?</h2>
          {hasMore && (
            <InteractiveMoreLink
              href={`/products/${product.id}/related`}
              className="text-xs font-medium text-gray-400 hover:text-gray-600"
            >
              더보기
            </InteractiveMoreLink>
          )}
        </div>
        <ProductGridList
          products={displayProducts}
          className="pc:grid-cols-4 pc:gap-3 grid-cols-3 gap-1.5 sm:grid-cols-3"
          cardClassName="p-0"
          displayTime={false}
        />
      </div>
    </div>
  );
}
