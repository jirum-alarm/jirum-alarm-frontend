'use client';

import { useEffect } from 'react';

import {
  isStrongPriceVerdict,
  type ProductPriceVerdict,
} from '@/features/product-detail/lib/price-verdict';

function pushEvent(event: string, props: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    ...props,
  });
}

type Props = {
  productId: number;
  /**
   * 서버(page.tsx)가 이미 받아둔 판정. 쿼리를 타지 않아 첫 HTML 에 박힌다
   * ("없다가 생기는" 깜빡임 제거). null 이면 미노출.
   */
  verdict?: ProductPriceVerdict | null;
};

/**
 * 상세 가격 아래 히어로. READY+STRONG 만 노출.
 * "기준 보기" → #price-history 로 스크롤.
 */
export default function PriceVerdictHero({ productId, verdict }: Props) {
  const visible = isStrongPriceVerdict(verdict);

  useEffect(() => {
    if (!visible || !verdict) return;
    pushEvent('price_verdict_impression', {
      productId,
      status: verdict.status,
      displayTier: verdict.displayTier,
      nullReason: verdict.nullReason,
      labelKey: verdict.labelKey,
      basis: verdict.basis,
      historyPointCount: verdict.historyPointCount,
      rangeDays: verdict.rangeDays,
      screen_width: window.innerWidth,
    });
  }, [visible, productId, verdict]);

  if (!visible || !verdict) return null;

  const onHistoryClick = () => {
    pushEvent('price_verdict_click_history', {
      productId,
      labelKey: verdict.labelKey,
      screen_width: window.innerWidth,
    });
    document
      .getElementById('price-history')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="pt-3">
      <button
        type="button"
        onClick={onHistoryClick}
        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left"
        aria-label="가격 추이 기준 보기"
      >
        <p className="text-sm font-semibold text-gray-800">{verdict.headline}</p>
        {verdict.subline ? <p className="mt-1 text-xs text-gray-500">{verdict.subline}</p> : null}
        <p className="mt-2 text-xs font-medium text-gray-400">기준 보기 ↓</p>
      </button>
    </div>
  );
}
