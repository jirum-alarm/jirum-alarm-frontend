import Link from 'next/link';

import { convertToWebp } from '@/shared/lib/utils/image';
import Badge from '@/shared/ui/common/Badge';
import ImageComponent from '@/shared/ui/ImageComponent';

import type { ListItem } from '@/features/deals/lib/deals-list-item';
import { buildModelDisplayName, relativeTimeLabel } from '@/features/deals/lib/model-page-insights';

/**
 * /deals 목록의 카드·줄 — 서버(page.tsx 의 펼친 부분)와 클라이언트(DealsFoldedMore 의 접힌 부분)가 같이 쓴다.
 * 서버 전용 코드를 가져오지 말 것(클라이언트 번들에 들어간다).
 */
export type { DealItem, ListItem } from '@/features/deals/lib/deals-list-item';

export function WaitingRow({ item: p }: { item: ListItem }) {
  return (
    <Link
      href={`/deals/${p.slug}`}
      className="flex items-center gap-3 rounded-lg border border-gray-100 p-2.5 hover:bg-gray-50"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-50">
        <ImageComponent
          src={convertToWebp(p.heroImage) ?? p.heroImage ?? ''}
          fallbackSrc={p.heroImage ?? undefined}
          fallback={<NoImage />}
          alt={p.modelName}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-gray-900">
          {buildModelDisplayName(p.brand, p.modelName)}
        </p>
        <p className="line-clamp-1 text-xs text-gray-500">
          {[
            waitingPriceText(p),
            p.lastDealAt ? `마지막 핫딜 ${relativeTimeLabel(p.lastDealAt)}` : null,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </Link>
  );
}

export function waitingPriceText(p: ListItem): string | null {
  if (p.buyLine != null && p.buyLine > 0) {
    return `적정가 ${p.buyLineUnitLabel ? `${p.buyLineUnitLabel} ` : ''}${p.buyLine.toLocaleString()}원 이하`;
  }
  if (p.heroMinPrice != null) return `지난 최저 ${p.heroMinPrice.toLocaleString()}원`;
  return null;
}

/**
 * 카드의 작은 추이선 — 최근 점 최대 12개. 마지막 점(가장 최근 추이)을 판정 색으로 찍는다.
 * 숫자 축은 그리지 않는다: 카드 폭에선 읽히지 않고, "지금이 바닥 쪽인가"만 보이면 된다.
 */
function TrendLine({ prices, tone }: { prices: number[]; tone: 'success' | 'warning' | 'gray' }) {
  if (prices.length < 3) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const W = 100;
  const H = 24;
  const y = (v: number) => (max === min ? H / 2 : 2 + (1 - (v - min) / (max - min)) * (H - 4));
  const x = (i: number) => (i / (prices.length - 1)) * (W - 4) + 2;
  const points = prices.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const last = prices.length - 1;
  const dotClass =
    tone === 'success'
      ? 'fill-success-500'
      : tone === 'warning'
        ? 'fill-warning-500'
        : 'fill-gray-400';
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-1.5 h-6 w-full"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        className="stroke-secondary-300"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x(last)} cy={y(prices[last])} r={2.5} className={dotClass} />
    </svg>
  );
}

export function DealCard({ item: p }: { item: ListItem }) {
  const isActive = p.activeDealCount > 0 && p.activePrice != null;
  const verdict = verdictBadge(p);
  return (
    <Link
      href={`/deals/${p.slug}`}
      className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full bg-gray-50">
        {/* CDN 은 webp 만 있고 원본 확장자(.jpg 등)는 403 — 원본을 그대로 쓰면 카드 90% 가 깨졌다
            (2026-10-05 운영 실측 60장 중 53장). 상세 히어로와 같이 webp 우선 + 원본 폴백. */}
        <ImageComponent
          src={convertToWebp(p.heroImage) ?? p.heroImage ?? ''}
          fallbackSrc={p.heroImage ?? undefined}
          fallback={<NoImage />}
          alt={p.modelName}
          // 고정 크기 = srcset 1x·2x 두 개뿐. fill+sizes 는 너비 14개를 카드마다 찍어
          // 757장에 img 태그만 1.2MB(HTML 3MB)였다(2026-10-05). 카드 실폭은 최대 ~240px.
          width={256}
          height={256}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex grow flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {buildModelDisplayName(p.brand, p.modelName)}
        </h3>
        {isActive ? (
          <div className="mt-auto">
            {verdict && (
              <Badge pill tone={verdict.tone} className="mb-1">
                {verdict.text}
              </Badge>
            )}
            <p className="text-lg font-semibold text-gray-900">
              {p.activePrice!.toLocaleString()}원
            </p>
            <p className="text-xs text-gray-500">
              {[
                relativeTimeLabel(p.activePostedAt),
                p.activeDealCount > 1 ? `진행 ${p.activeDealCount}건` : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <TrendLine prices={p.trendPrices ?? []} tone={verdict?.tone ?? 'gray'} />
          </div>
        ) : (
          <div className="mt-auto">
            {p.buyLine != null && p.buyLine > 0 ? (
              <>
                <p className="text-xs text-gray-500">적정가</p>
                <p className="text-base font-semibold text-gray-900">
                  {p.buyLineUnitLabel ? `${p.buyLineUnitLabel} ` : ''}
                  {p.buyLine.toLocaleString()}원 이하
                </p>
              </>
            ) : p.heroMinPrice != null ? (
              <>
                <p className="text-xs text-gray-500">지난 핫딜 최저</p>
                <p className="text-base font-semibold text-gray-900">
                  {p.heroMinPrice.toLocaleString()}원
                </p>
              </>
            ) : null}
            {p.lastDealAt && (
              <p className="text-xs text-gray-500">마지막 핫딜 {relativeTimeLabel(p.lastDealAt)}</p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function NoImage() {
  return <div className="flex h-full items-center justify-center text-gray-300">이미지 없음</div>;
}

/**
 * 판정 배지. 색은 상세 페이지의 타이밍 배지와 같다(좋음=emerald·비쌈=amber·평소=gray).
 * 단위 축이면 "%"가 용량당 비교라 단위를 붙인다 — 총액은 팩 크기가 달라 더 비싸 보일 수 있다.
 */
export function verdictBadge(
  p: ListItem,
): { text: string; tone: 'success' | 'warning' | 'gray' } | null {
  const unit = p.buyLineUnitLabel ? `${p.buyLineUnitLabel} ` : '';
  switch (p.priceTone) {
    case 'lowest':
      return {
        text: `역대 최저 · ${unit}${p.savePct}%↓`,
        tone: 'success',
      };
    case 'cheap':
      return {
        text: `평소보다 ${unit}${p.savePct}%↓`,
        tone: 'success',
      };
    case 'fair':
      return { text: '평소 수준', tone: 'gray' };
    case 'high':
      return { text: '평소보다 비싸요', tone: 'warning' };
    default:
      return null;
  }
}

export function DealGrid({ items, className }: { items: ListItem[]; className?: string }) {
  // 열수: 모바일 2 → sm 3 → PC 5 (랭킹 TrackedProductGridList와 동일).
  return (
    <ul
      className={`pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 gap-3 sm:grid-cols-3 ${className ?? ''}`}
    >
      {items.map((p) => (
        <li key={p.slug}>
          <DealCard item={p} />
        </li>
      ))}
    </ul>
  );
}

export function DealRows({ items, className }: { items: ListItem[]; className?: string }) {
  return (
    <ul className={`pc:grid-cols-3 grid grid-cols-1 gap-2 sm:grid-cols-2 ${className ?? ''}`}>
      {items.map((p) => (
        <li key={p.slug}>
          <WaitingRow item={p} />
        </li>
      ))}
    </ul>
  );
}
