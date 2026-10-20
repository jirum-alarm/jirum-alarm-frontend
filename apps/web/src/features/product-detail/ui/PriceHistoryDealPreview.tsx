'use client';

import { PRICE_PREVIEW_HINT } from '@jirum/domain/price-chart';
import Link from 'next/link';

import type { PriceHistoryPoint } from '@/shared/api/product/product.service';
import { convertToWebp } from '@/shared/lib/utils/image';
import ImageComponent from '@/shared/ui/ImageComponent';

import { dealTitle, formatAxisDate, won } from '../lib/price-history';

import { CHART } from './PriceLineChart';

/**
 * 가격 추이에서 고른 점(또는 이 상품)의 딜 카드.
 * linkable=false(지금 보는 상품)면 링크가 아닌 카드 — 링크면 같은 페이지라 눌러도 아무 일이 없었다(dead click).
 */
export default function PriceHistoryDealPreview({
  point,
  currency,
  isCurrent,
  linkable,
  onClick,
}: {
  point: PriceHistoryPoint;
  currency: string;
  isCurrent: boolean;
  linkable: boolean;
  onClick: () => void;
}) {
  const deal = point.deal;
  const body = (
    <>
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-gray-50">
        {deal.thumbnail ? (
          /* webp 우선 + 원본 폴백 (S3 webp 커버리지 91.8%, CDN 은 폴백 안 해줌) */
          <ImageComponent
            src={convertToWebp(deal.thumbnail) ?? deal.thumbnail}
            fallbackSrc={deal.thumbnail}
            alt=""
            fill
            sizes="44px"
            className="object-contain"
          />
        ) : (
          <div className="h-full w-full bg-gray-100" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs text-gray-900">{dealTitle(deal)}</div>
        {deal.providerName && (
          <div className="text-11 mt-0.5 truncate text-gray-500">{deal.providerName}</div>
        )}
      </div>
      <span className="text-error-600 shrink-0 text-xs font-semibold tabular-nums">
        {won(deal.parsedPrice, deal.priceCurrency ?? currency)}
      </span>
    </>
  );

  return (
    <div className="mt-3">
      <div className="rounded-xl border border-gray-200 bg-white p-2.5">
        <div className="text-11 mb-1.5 flex h-4 items-center gap-2 text-gray-500">
          {isCurrent ? (
            <span
              className="inline-block size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: CHART.current }}
            />
          ) : (
            <span className="inline-block size-1.5 shrink-0 opacity-0" aria-hidden />
          )}
          <span className="truncate">
            {formatAxisDate(point.date, true)}
            {isCurrent ? ' · 이 상품' : ''}
          </span>
        </div>
        {linkable ? (
          <Link
            href={`/products/${deal.id}`}
            data-track="product-card"
            data-source="price_history"
            data-product-id={deal.id}
            onClick={onClick}
            className="flex items-center gap-2.5 hover:opacity-90"
          >
            {body}
          </Link>
        ) : (
          <div className="flex items-center gap-2.5">{body}</div>
        )}
      </div>
      {!linkable && <p className="text-11 mt-1.5 text-gray-500">{PRICE_PREVIEW_HINT}</p>}
    </div>
  );
}
