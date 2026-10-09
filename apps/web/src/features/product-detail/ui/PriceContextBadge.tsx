'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { ProductService } from '@/shared/api/product';

import { ProductQueries } from '@/entities/product';

// "왜 핫딜인지" 가격 컨텍스트.
// 백엔드 priceContext resolver 가 게이트(카테고리/통화/양수/floor/sanity/mallCount) 통과 시에만
// 값을 내려준다 → 여기서는 "있으면 표시"만. 게이트 로직 재구현 금지(DRY, 백엔드 단일 진실원천).
// 디자인: 연한 빨강 카드 + 할인율 빨강 강조(기존 핫딜배지 #EB001C 톤) — 눈에 띄게.
type PriceContextBadgeProps = {
  productId: number;
  /** user_history source — detail_mobile | detail_desktop */
  source: string;
};

export default function PriceContextBadge({ productId, source }: PriceContextBadgeProps) {
  const { data: product } = useSuspenseQuery(
    ProductQueries.productAdditionalInfo({ id: productId }),
  );
  const priceContext = product.priceContext;

  // 배지가 실제로 그려질 때만, 상세 진입당 1회.
  const impressedRef = useRef<number | null>(null);
  useEffect(() => {
    if (!priceContext || impressedRef.current === productId) return;
    impressedRef.current = productId;
    void ProductService.collectPriceContextImpression({
      productId,
      source,
      detail: 'danawa_badge:DANAWA',
    }).catch(() => {});
  }, [priceContext, productId, source]);

  if (!priceContext) return null;

  const { danawaPrice, delta, normalPriceMin, normalPriceMax, shippingIncluded } = priceContext;
  const percent = Math.round(delta * 100);

  // 정상가 범위는 너무 넓으면(액세서리·변형 섞임) 신뢰를 깎으므로 숨김. max/min > 3배면 미표시.
  const hasRange =
    typeof normalPriceMin === 'number' &&
    typeof normalPriceMax === 'number' &&
    normalPriceMin > 0 &&
    normalPriceMax > 0 &&
    normalPriceMax / normalPriceMin <= 3;

  return (
    <div className="border-error-100 bg-error-50/50 dark:bg-error-50 mt-3 rounded-xl border px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">다나와 최저가 대비</span>
        <span className="text-error-500 text-lg font-bold">{percent}% 저렴</span>
      </div>
      <div className="border-error-100 mt-2.5 flex items-center justify-between border-t pt-2.5">
        <span className="text-sm text-gray-500">
          {/* 기준가가 배송비 포함 총액일 때만 — 딜 가격엔 배송비가 빠졌을 수 있다 */}
          다나와 최저가{shippingIncluded ? ' (배송비 포함)' : ''}
        </span>
        <span className="text-sm font-medium text-gray-700">{danawaPrice.toLocaleString()}원</span>
      </div>
      {hasRange && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-sm text-gray-500">정상가 범위</span>
          <span className="text-sm text-gray-500">
            {normalPriceMin!.toLocaleString()} ~ {normalPriceMax!.toLocaleString()}원
          </span>
        </div>
      )}
    </div>
  );
}
