'use client';

import { COMMUNITY_HOT_DEAL_OPTIONS, dailyHotDealOptionIndex } from '@jirum/domain/community';
import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/shared/lib/utils/date';
import { Skeleton } from '@/shared/ui/common/Skeleton';

import { ProductQueries } from '@/entities/product';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

// 섹션 후보·오늘(KST) 고르기는 정본 @jirum/domain/community(앱과 같은 날 같은 섹션).
const RANKING_OPTIONS = COMMUNITY_HOT_DEAL_OPTIONS;
const getDailyOptionIndex = () => dailyHotDealOptionIndex();

type ProductItem = {
  id: string | number;
  title: string;
  thumbnail?: string | null;
  price?: string | null;
  categoryId?: number | null;
};

function ProductList({ products }: { products: ProductItem[] }) {
  return (
    <div className="smd:grid-cols-6 grid grid-cols-3 gap-x-2 gap-y-3 px-5 pb-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="flex flex-col transition-transform active:scale-[0.98]"
        >
          <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
            <ProductThumbnail
              src={product.thumbnail ?? ''}
              alt={product.title}
              title={product.title}
              categoryId={product.categoryId}
              type="product"
              sizes="(max-width: 550px) 30vw, 15vw"
            />
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

function HotDealRankingList() {
  const { data } = useSuspenseQuery(
    ProductQueries.hotDealRankingProducts({
      page: 0,
      limit: 6,
    }),
  );

  const products = data?.hotDealRankingProducts ?? [];
  if (products.length === 0) return null;

  return <ProductList products={products} />;
}

function RankingList({ categoryId }: { categoryId: number | null }) {
  const { data } = useSuspenseQuery(
    ProductQueries.products({
      limit: 6,
      orderBy: ProductOrderType.CommunityRanking,
      startDate: getDayBefore(3),
      categoryId,
      orderOption: OrderOptionType.Desc,
      isEnd: false,
    }),
  );

  const products = data?.products ?? [];
  if (products.length === 0) return null;

  return <ProductList products={products} />;
}

const HotDealsSkeleton = () => (
  <div className="smd:grid-cols-6 grid grid-cols-3 gap-x-2 gap-y-3 px-5 pb-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i}>
        <Skeleton className="aspect-square rounded-xl" />
        <Skeleton className="mt-1.5 h-3 w-full rounded" />
      </div>
    ))}
  </div>
);

export default function CommunityHotDeals() {
  const option = useMemo(() => RANKING_OPTIONS[getDailyOptionIndex()], []);

  return (
    <section className="mt-2 border-t border-gray-100 pt-4">
      <div className="mb-3 flex items-center justify-between px-5">
        <h2 className="text-sm font-semibold text-gray-900">{option.label}</h2>
        <Link
          href={option.link}
          className="text-xs text-gray-500 transition-transform active:scale-95"
        >
          더보기
        </Link>
      </div>
      <Suspense fallback={<HotDealsSkeleton />}>
        {option.type === 'hotdeal' ? (
          <HotDealRankingList />
        ) : (
          <RankingList categoryId={option.categoryId} />
        )}
      </Suspense>
    </section>
  );
}
