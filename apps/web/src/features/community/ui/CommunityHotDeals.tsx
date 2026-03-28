'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/shared/lib/utils/date';

import { ProductQueries } from '@/entities/product';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

type RankingOption =
  | { label: string; type: 'hotdeal'; link: string }
  | { label: string; type: 'ranking'; categoryId: number | null; link: string };

const RANKING_OPTIONS: RankingOption[] = [
  { label: '지금 인기 핫딜', type: 'hotdeal', link: '/curation/hotdeal' },
  { label: '전체 랭킹', type: 'ranking', categoryId: null, link: '/trending/ranking' },
  {
    label: "'생활·식품' 인기 상품",
    type: 'ranking',
    categoryId: 2,
    link: '/trending/ranking?tab=2',
  },
  {
    label: "'컴퓨터' 인기 상품",
    type: 'ranking',
    categoryId: 1,
    link: '/trending/ranking?tab=1',
  },
];

// 날짜 기반 인덱스: 서버/클라이언트 동일한 값 보장
const getDailyOptionIndex = () => new Date().getDate() % RANKING_OPTIONS.length;

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

const Skeleton = () => (
  <div className="smd:grid-cols-6 grid grid-cols-3 gap-x-2 gap-y-3 px-5 pb-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i}>
        <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />
        <div className="mt-1.5 h-3 w-full animate-pulse rounded bg-gray-100" />
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
      <Suspense fallback={<Skeleton />}>
        {option.type === 'hotdeal' ? (
          <HotDealRankingList />
        ) : (
          <RankingList categoryId={option.categoryId} />
        )}
      </Suspense>
    </section>
  );
}
