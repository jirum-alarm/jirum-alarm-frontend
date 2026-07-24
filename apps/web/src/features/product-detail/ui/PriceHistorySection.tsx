'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { PriceHistoryDeal, PriceHistoryPoint } from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';

import { ProductQueries } from '@/entities/product';

type Props = {
  productId: number;
};

function won(price: number, currency?: string | null): string {
  if (currency === 'USD') return `$${Math.round(price).toLocaleString()}`;
  return `${Math.round(price).toLocaleString()}원`;
}

function formatDateLabel(date: string): string {
  // "2026-07-24" → "7/24"
  const m = date.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!m) return date.slice(5);
  return `${Number(m[1])}/${Number(m[2])}`;
}

function dealTitle(deal: PriceHistoryDeal): string {
  return deal.displayTitle || deal.title || `상품 #${deal.id}`;
}

/**
 * 상세 일별 핫딜가 추이.
 * - null / 점 부족이면 섹션 숨김
 * - 막대 hover/focus 시 대표 딜 카드 + 같은 날 다른 딜
 * - 카드 클릭 → 해당 딜 상세
 */
export default function PriceHistorySection({ productId }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => setMounted(true), []);

  const { data, isLoading, isError, error } = useQuery({
    ...ProductQueries.priceHistory({ id: productId, days: 90 }),
    enabled: mounted,
  });

  const history = data?.product?.priceHistory ?? null;
  const points = history?.points ?? [];

  // 개발 중 안 보이는 원인 파악용 — 쿼리 실패면 섹션을 숨기지 않고 표시
  if (mounted && isError && process.env.NODE_ENV === 'development') {
    return (
      <section className="pc:px-0 px-5 py-6">
        <h2 className="text-base font-semibold">핫딜가 추이</h2>
        <p className="mt-2 text-xs text-red-500">
          priceHistory 조회 실패: {error instanceof Error ? error.message : 'unknown'}
        </p>
      </section>
    );
  }

  if (!mounted || isLoading || isError || !history || points.length < 2) {
    return null;
  }

  const prices = points.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const barH = (price: number) => {
    if (maxPrice === minPrice) return 44;
    return 22 + ((price - minPrice) / (maxPrice - minPrice)) * 54; // 22~76
  };

  const active: PriceHistoryPoint | null =
    activeIdx != null && activeIdx >= 0 && activeIdx < points.length ? points[activeIdx] : null;
  // 기본 선택은 최신 점(오른쪽) — 호버 전에도 카드가 보이면 모바일에서 바로 탭 가능
  const selected = active ?? points[points.length - 1];
  const currency = history.currency;

  return (
    <section className="pc:px-0 px-5 py-6">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">핫딜가 추이</h2>
        <span className="text-xs text-gray-400">최근 {history.rangeDays}일 · 일별 최저</span>
      </div>
      <p className="mb-3 text-xs text-gray-500">
        역대 최저 <span className="text-error-500 font-semibold">{won(minPrice, currency)}</span>
        <span className="text-gray-300"> · </span>
        최고 {won(maxPrice, currency)}
        {history.confidence === 'LOW' && (
          <>
            <span className="text-gray-300"> · </span>
            <span className="text-gray-400">유사 상품 추정</span>
          </>
        )}
      </p>

      {history.disclaimer && (
        <p className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
          {history.disclaimer}
        </p>
      )}

      <div
        className="flex items-end gap-1"
        style={{ height: 112 }}
        onMouseLeave={() => setActiveIdx(null)}
      >
        {points.map((p, i) => {
          const isLow = p.price === minPrice;
          const isActive = (activeIdx ?? points.length - 1) === i;
          const isSeedDay = p.deal.isSeed;
          const showLabel = i % Math.ceil(points.length / 6) === 0 || i === points.length - 1;
          return (
            <button
              key={p.date}
              type="button"
              className="flex flex-1 flex-col items-center justify-end gap-1 focus:outline-none"
              onMouseEnter={() => setActiveIdx(i)}
              onFocus={() => setActiveIdx(i)}
              onClick={() => setActiveIdx(i)}
              aria-label={`${p.date} ${won(p.price, currency)}`}
            >
              {(isLow || isActive) && (
                <span
                  className={cn(
                    'text-[9px] whitespace-nowrap',
                    isLow ? 'text-error-500 font-semibold' : 'text-gray-500',
                  )}
                >
                  {won(p.price, currency)}
                </span>
              )}
              <div
                className={cn(
                  'w-full max-w-8 rounded-t transition-colors',
                  isLow ? 'bg-error-400' : isActive ? 'bg-secondary-500' : 'bg-secondary-300',
                  isSeedDay && 'ring-secondary-600 ring-2 ring-offset-1',
                )}
                style={{ height: `${barH(p.price)}px` }}
              />
              <span className="h-3 text-[9px] text-gray-400">
                {showLabel ? formatDateLabel(p.date) : ''}
              </span>
            </button>
          );
        })}
      </div>

      <DealCard point={selected} currency={currency} />
    </section>
  );
}

function DealCard({ point, currency }: { point: PriceHistoryPoint; currency: string }) {
  const deal = point.deal;
  const extras = point.deals.filter((d) => d.id !== deal.id).slice(0, 3);

  return (
    <div className="mt-4 rounded-xl border border-gray-100 bg-white p-3">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <span>{point.date}</span>
        {deal.isSeed && (
          <span className="bg-secondary-50 text-secondary-700 rounded px-1.5 py-0.5 font-medium">
            현재 딜
          </span>
        )}
      </div>
      <Link
        href={`/products/${deal.id}`}
        data-track="product-card"
        data-source="price_history"
        data-product-id={deal.id}
        className="flex items-center gap-3 hover:opacity-90"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-50">
          {deal.thumbnail ? (
            <Image src={deal.thumbnail} alt="" fill sizes="56px" className="object-contain" />
          ) : (
            <div className="h-full w-full bg-gray-100" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-sm text-gray-900">{dealTitle(deal)}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            {deal.providerName && <span className="text-gray-500">{deal.providerName}</span>}
            <span>{new Date(deal.postedAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
        <span className="text-error-500 shrink-0 text-sm font-semibold">
          {won(deal.parsedPrice, deal.priceCurrency ?? currency)}
        </span>
      </Link>

      {extras.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-gray-50 pt-2">
          {extras.map((d) => (
            <li key={d.id}>
              <Link
                href={`/products/${d.id}`}
                data-track="product-card"
                data-source="price_history_same_day"
                data-product-id={d.id}
                className="flex items-center justify-between gap-2 text-xs text-gray-500 hover:text-gray-800"
              >
                <span className="line-clamp-1">
                  {d.providerName ? `${d.providerName} · ` : ''}
                  {dealTitle(d)}
                </span>
                <span className="shrink-0 font-medium text-gray-700">
                  {won(d.parsedPrice, currency)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
