'use client';

import Image from 'next/image';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';

import { Deal, dealComparePrice, HistBasis, isLikelyBundleDeal } from './model-page-insights';

function won(n?: number | null): string {
  if (n == null) return '-';
  return `${Math.round(n).toLocaleString()}원`;
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
}

export default function DealsListSection({
  activeDeals,
  historyDeals,
  histBasis,
  histUnitLabel,
  histMin,
  listTitleSuffix,
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
        <p className="mb-3 text-sm text-gray-400">
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
          const isActivePick = tab === 'active' && !deal.isEnd && !isBundle && deals[0] === deal;

          return (
            <li key={deal.productId}>
              <a
                href={`/products/${deal.productId}`}
                className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 hover:bg-gray-50"
              >
                {deal.thumbnail && (
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-gray-50">
                    <Image
                      src={deal.thumbnail}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm">{deal.title}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                    {deal.mallName && <span className="text-gray-500">{deal.mallName}</span>}
                    {deal.postedAt && (
                      <span>{new Date(deal.postedAt).toLocaleDateString('ko-KR')}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  {deal.isEnd && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
                      종료
                    </span>
                  )}
                  {isBundle && (
                    <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      증정·번들
                    </span>
                  )}
                  {isActivePick && (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      지금 추천
                    </span>
                  )}
                  {isAllTimeLow && (
                    <span className="bg-error-50 text-error-600 rounded px-1.5 py-0.5 text-[10px] font-semibold">
                      역대 최저
                    </span>
                  )}
                  <span
                    className={`text-sm font-medium ${deal.isEnd ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                  >
                    {won(deal.price)}
                  </span>
                  {deal.unitPrice != null && deal.unitLabel && (
                    <span className="text-[11px] text-gray-400">
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
        <p className="text-sm text-gray-400">표시할 핫딜이 없습니다.</p>
      )}
    </section>
  );
}
