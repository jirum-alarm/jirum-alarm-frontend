'use client';

import { dealRow, emptyText } from '@jirum/design-system/recipes';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { convertToWebp } from '@/shared/lib/utils/image';
import Badge from '@/shared/ui/common/Badge';
import ImageComponent from '@/shared/ui/ImageComponent';

import {
  cleanDealTitle,
  Deal,
  dealComparePrice,
  HistBasis,
  isForeignPriceDeal,
  isLikelyBundleDeal,
} from '@/features/deals/lib/model-page-insights';

function won(n?: number | null): string {
  if (n == null) return '-';
  return `${Math.round(n).toLocaleString()}원`;
}

/** 직구 딜(달러 페이지 전체, 또는 원화 페이지에 섞인 소수 가격 딜)은 달러로 — 예전엔 $219.76 이 "220원"으로 보였다. */
function dealPrice(deal: Deal, currency: 'KRW' | 'USD'): string {
  if (deal.price == null) return '-';
  return currency === 'USD' || isForeignPriceDeal(deal, currency)
    ? `$${deal.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : won(deal.price);
}

type Tab = 'active' | 'history';

interface Props {
  activeDeals: Deal[];
  historyDeals: Deal[];
  histBasis: HistBasis;
  histUnitLabel?: string | null;
  /** 추이 최저 — 동일 축 비교용. 이력 탭에서만 '역대 최저' 배지. */
  histMin: number;
  listTitleSuffix: string;
  currency: 'KRW' | 'USD';
}

export default function DealsListSection({
  activeDeals,
  historyDeals,
  histBasis,
  histUnitLabel,
  histMin,
  listTitleSuffix,
  currency,
}: Props) {
  const hasActive = activeDeals.length > 0;
  const [tab, setTab] = useState<Tab>(hasActive ? 'active' : 'history');
  const deals = tab === 'active' ? activeDeals : historyDeals;

  return (
    <section id="deals-list" className="mb-6 scroll-mt-20">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-base font-semibold">핫딜 목록 ({listTitleSuffix})</h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 text-xs">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={cn(
              'rounded-md px-2.5 py-1 font-medium transition-colors',
              tab === 'active' ? 'bg-white text-gray-900' : 'text-gray-500',
            )}
          >
            진행 중{hasActive ? ` ${activeDeals.length}` : ''}
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={cn(
              'rounded-md px-2.5 py-1 font-medium transition-colors',
              tab === 'history' ? 'bg-white text-gray-900' : 'text-gray-500',
            )}
          >
            전체 이력
          </button>
        </div>
      </div>

      {tab === 'active' && !hasActive && (
        <p className={cn('mb-3', emptyText)}>
          지금 진행 중인 핫딜이 없습니다. 전체 이력에서 과거 최저가를 확인해 보세요.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {deals.map((deal) => {
          const comparePrice = dealComparePrice(deal, histBasis, histUnitLabel);
          const isBundle = isLikelyBundleDeal(deal.title);
          // 역대 최저: 이력 탭 + 비번들 + 동일 축. 진행 탭에선 '지금 추천'만.
          const isAllTimeLow =
            tab === 'history' &&
            !isBundle &&
            histMin > 0 &&
            comparePrice != null &&
            comparePrice <= histMin;
          const isActivePick =
            tab === 'active' &&
            !deal.isEnd &&
            !isBundle &&
            !isForeignPriceDeal(deal, currency) &&
            deals[0] === deal;
          const title = cleanDealTitle(deal.title);

          return (
            <li key={deal.productId}>
              <a
                href={`/products/${deal.productId}`}
                className={cn('flex items-center gap-3', dealRow)}
              >
                {/* 썸네일 없는 딜(약 40%)도 자리를 비워 두지 않는다 — 없으면 제목 시작선이 줄마다 들쭉날쭉했다. */}
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-50">
                  {/* webp 를 먼저 요청하고, 없으면(S3 변환 누락 8%) 원본으로 폴백한다.
                      같은 이미지가 원본 169KB vs webp 15KB — 11배 차이(2026-09-02 실측).
                      이 목록은 한 페이지에 딜이 수백 개라 여기가 모델페이지 전송량의 대부분. */}
                  {deal.thumbnail && (
                    <ImageComponent
                      src={convertToWebp(deal.thumbnail) ?? deal.thumbnail}
                      fallbackSrc={deal.thumbnail}
                      alt={title}
                      // fill+sizes="56px" 는 px 만 있어 srcset 에 너비 14개가 다 붙는다 — 고정 크기로 1x·2x 만.
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm">{title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {deal.mallName && <span className="text-gray-500">{deal.mallName}</span>}
                    {deal.postedAt && (
                      <span>{new Date(deal.postedAt).toLocaleDateString('ko-KR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  {deal.isEnd && <Badge size="xs">종료</Badge>}
                  {isBundle && (
                    <Badge size="xs" tone="warning">
                      증정·번들
                    </Badge>
                  )}
                  {isActivePick && (
                    <Badge size="xs" tone="success">
                      지금 추천
                    </Badge>
                  )}
                  {isAllTimeLow && (
                    <Badge size="xs" tone="error">
                      역대 최저
                    </Badge>
                  )}
                  <span
                    className={`text-sm font-medium ${deal.isEnd ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                  >
                    {dealPrice(deal, currency)}
                  </span>
                  {deal.unitPrice != null && deal.unitLabel && (
                    <span className="text-11 text-gray-400">
                      {deal.unitLabel} {won(deal.unitPrice)}
                    </span>
                  )}
                </div>
              </a>
            </li>
          );
        })}
      </ul>
      {deals.length === 0 && tab === 'history' && (
        <p className={emptyText}>표시할 핫딜이 없습니다.</p>
      )}
    </section>
  );
}
