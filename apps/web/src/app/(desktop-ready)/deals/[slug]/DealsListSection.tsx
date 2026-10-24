'use client';

import { dealRow, emptyText, text } from '@jirum/design-system/recipes';
import { useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { convertToWebp } from '@/shared/lib/utils/image';
import Badge from '@/shared/ui/common/Badge';
import ImageComponent from '@/shared/ui/ImageComponent';

import {
  cleanDealTitle,
  Deal,
  dealComparePrice,
  formatDealPrice,
  HistBasis,
} from '@/features/deals/lib/model-page-insights';

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
  /** 추이 최저 — 동일 축 비교용. 이력 탭에서만 '기록상 최저' 배지(우리가 모은 핫딜 기록이라 «역대»라 부르지 않는다 — 판정 배지와 같은 말). */
  histMin: number;
  listTitleSuffix: string;
  currency: 'KRW' | 'USD';
  /** 「지금 추천」 딜 = 서버 판정이 고른 딜. 다나와가 더 싸면 null. */
  pickProductId: number | null;
  /** 증정·포인트가 섞여 판정에서 뺀 딜(서버 판정). 배지·추천에서 뺀다. */
  bundleProductIds: number[];
}

export default function DealsListSection({
  activeDeals,
  historyDeals,
  histBasis,
  histUnitLabel,
  histMin,
  listTitleSuffix,
  currency,
  pickProductId,
  bundleProductIds,
}: Props) {
  const bundleIds = new Set(bundleProductIds);
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
          지금 진행 중인 핫딜이 없어요. 전체 이력에서 과거 최저가를 확인해 보세요.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {deals.map((deal) => {
          const comparePrice = dealComparePrice(deal, histBasis, histUnitLabel);
          const isBundle = bundleIds.has(deal.productId);
          // 기록상 최저: 이력 탭 + 비번들 + 동일 축. 진행 탭에선 '지금 추천'만.
          const isAllTimeLow =
            tab === 'history' &&
            !isBundle &&
            histMin > 0 &&
            comparePrice != null &&
            comparePrice <= histMin;
          const isActivePick = tab === 'active' && deal.productId === pickProductId;
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
                  <div className={cn(text.caption, 'mt-1 flex flex-wrap items-center gap-2')}>
                    {deal.mallName && <span className="text-gray-500">{deal.mallName}</span>}
                    {/* 한국 날짜로 — 서버(UTC)와 브라우저가 다른 날을 찍어 밤 딜마다 하이드레이션이 깨졌다(2026-10-24 화면 하네스). */}
                    {deal.postedAt && (
                      <span>
                        {new Date(deal.postedAt).toLocaleDateString('ko-KR', {
                          timeZone: 'Asia/Seoul',
                        })}
                      </span>
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
                      기록상 최저
                    </Badge>
                  )}
                  <span
                    className={`text-sm font-medium ${deal.isEnd ? 'text-gray-500 line-through' : 'text-gray-700'}`}
                  >
                    {formatDealPrice(deal, currency)}
                  </span>
                  {deal.unitPrice != null && deal.unitLabel && (
                    <span className="text-11 text-gray-500">
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
        <p className={emptyText}>보여 드릴 핫딜이 없어요.</p>
      )}
    </section>
  );
}
