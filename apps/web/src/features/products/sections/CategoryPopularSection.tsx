'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import { PAGE } from '@/constants/page';

import { ThumbnailType } from '@shared/api/gql/graphql';

import { ProductQueries } from '@entities/product';

import { CarouselProductsSection } from '../carousel';

type Props = {
  categoryId: number | null;
  categoryName?: string | null;
  titlePrefix?: string; // e.g., ‘{카테고리}’에서 인기있는 상품
  limit?: number;
  logging?: { page: keyof typeof PAGE };
};

export default function CategoryPopularSection({
  categoryId,
  categoryName,
  titlePrefix = '‘{category}’에서 인기있는 상품',
  limit = 20,
}: Props) {
  const { data } = useSuspenseQuery(
    ProductQueries.products({
      limit,
      categoryId: categoryId ?? 0,
      thumbnailType: ThumbnailType.Mall,
      isEnd: false,
    }),
  );

  const products = data.products;

  const title = (titlePrefix || '').replace('{category}', categoryName || '기타');

  if (!products.length) return null;

  return <CarouselProductsSection title={title} products={products} />;
}
