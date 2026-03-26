'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/shared/lib/utils/date';

import { ProductQueries } from '@/entities/product';

function HotDealsList() {
  const { data } = useSuspenseQuery(
    ProductQueries.products({
      limit: 10,
      orderBy: ProductOrderType.CommunityRanking,
      startDate: getDayBefore(3),
      categoryId: null,
      orderOption: OrderOptionType.Desc,
      isEnd: false,
    }),
  );

  const products = data?.products ?? [];
  if (products.length === 0) return null;

  return (
    <div className="flex gap-x-3 overflow-x-auto px-5 pb-4" style={{ scrollbarWidth: 'none' }}>
      {products.map((product, i) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="flex w-28 flex-shrink-0 flex-col transition-transform active:scale-[0.98]"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            {product.thumbnail && (
              <Image
                src={product.thumbnail}
                alt={product.title}
                fill
                className="object-cover"
                sizes="112px"
              />
            )}
            <span
              className={[
                'absolute top-1.5 left-1.5 text-sm font-bold drop-shadow-sm',
                i === 0
                  ? 'text-red-500'
                  : i === 1
                    ? 'text-orange-400'
                    : i === 2
                      ? 'text-yellow-500'
                      : 'text-white',
              ].join(' ')}
            >
              {i + 1}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-tight text-gray-900">{product.title}</p>
          {product.price && (
            <p className="mt-0.5 text-xs font-semibold text-gray-700">{product.price}</p>
          )}
        </Link>
      ))}
    </div>
  );
}

export default function CommunityHotDeals() {
  return (
    <section className="mt-2 border-t border-gray-100 pt-4">
      <div className="mb-3 flex items-center justify-between px-5">
        <h2 className="text-sm font-semibold text-gray-900">지름 랭킹</h2>
        <Link
          href="/trending/ranking"
          className="text-xs text-gray-500 transition-transform active:scale-95"
        >
          더보기
        </Link>
      </div>
      <Suspense
        fallback={
          <div className="flex gap-x-3 overflow-hidden px-5 pb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-28 flex-shrink-0">
                <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
                <div className="mt-1.5 h-3 w-full animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        }
      >
        <HotDealsList />
      </Suspense>
    </section>
  );
}
