'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';
import { CarouselProductsSection } from '@/entities/product-list/ui/carousel';

type Props = {
  productId: number;
};

/**
 * 토스 상세의 「토스에서 함께 보는 상품」 (실험 toss_internal_link_v1, 2026-10-14).
 * 토스 상품 페이지로 들어오는 내부 링크가 거의 없어(자주 긁히는 페이지의 상품 링크 887개 중 7개) 네이버가 13%만 긁는다.
 * 서버가 링크 받는 군 토스 상품만 골라 준다 — 대조군은 어디서도 이 링크를 받지 않는다. 서버 렌더에 링크가 실려야 의미가 있어
 * useSuspenseQuery 로 HTML 에 넣는다.
 */
export default function TossInternalLinksSection({ productId }: Props) {
  const { data } = useSuspenseQuery(ProductQueries.tossInternalLinks({ id: productId }));
  const products = data?.tossInternalLinks ?? [];

  if (!products.length) return null;

  return (
    <CarouselProductsSection
      title="토스에서 함께 보는 상품"
      products={products}
      source="toss_internal_link"
    />
  );
}
