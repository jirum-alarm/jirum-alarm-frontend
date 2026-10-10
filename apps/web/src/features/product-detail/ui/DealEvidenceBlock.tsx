'use client';

import { infoBox } from '@jirum/design-system/recipes';
import { useEffect, useRef } from 'react';

import { ProductService } from '@/shared/api/product';
import type { ProductDealEvidence } from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';

function pushEvent(event: string, props: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    ...props,
  });
}

/** 「근거 보기」가 내려갈 섹션. 다나와 근거는 블록 안 숫자가 근거라 링크가 없다. */
const SCROLL_TARGET: Record<string, string | undefined> = {
  HISTORY: 'price-history',
  COMMUNITY: 'community-reaction',
};

type Props = {
  productId: number;
  /** user_history source — detail_mobile | detail_desktop */
  source: string;
  /** 서버(page.tsx)가 받아둔 근거. 쿼리를 타지 않아 첫 HTML 에 박힌다. */
  evidence?: ProductDealEvidence | null;
};

/**
 * 왜 핫딜인지 — 가격 바로 아래 블록 하나. 무엇을 쓸지는 서버(dealEvidence)가 정하고 여기선 그리기만.
 * 판정 카드·다나와 카드를 대신한다(같은 질문에 카드 두 장·기준 둘이던 것). 근거가 없으면 자리를 안 잡는다.
 * 모양은 상세 권유 카드 문법(28px 원 + 두 줄, 채운 버튼 없음) — 아래 구매 버튼과 경쟁하지 않게.
 */
export default function DealEvidenceBlock({ productId, source, evidence }: Props) {
  const headline = evidence?.headline ?? null;
  const impressedRef = useRef<number | null>(null);

  useEffect(() => {
    if (!headline || impressedRef.current === productId) return;
    impressedRef.current = productId;
    // GA4 이벤트 이름은 판정 카드 때 그대로 — GTM 태그가 이 이름을 본다.
    pushEvent('price_verdict_impression', {
      productId,
      kind: headline.kind,
      strength: headline.strength,
      screen_width: window.innerWidth,
    });
    void ProductService.collectPriceContextImpression({
      productId,
      source,
      detail: `evidence:${headline.kind}`,
    }).catch(() => {});
  }, [headline, productId, source]);

  if (!evidence || !headline) return null;

  const target = SCROLL_TARGET[headline.kind];
  const onMore = () => {
    if (!target) return;
    pushEvent('price_verdict_click_history', {
      productId,
      kind: headline.kind,
      screen_width: window.innerWidth,
    });
    void ProductService.collectPriceContextClick({
      productId,
      source,
      detail: `evidence:${headline.kind}`,
    }).catch(() => {});
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const strong = headline.strength === 'STRONG';
  const isPeople = headline.kind === 'COMMUNITY';
  const hasFooter = !!(evidence.support || evidence.caveat);
  const moreButton = target ? (
    <button
      type="button"
      onClick={onMore}
      className="shrink-0 text-xs text-gray-500"
      aria-label="근거 보기"
    >
      근거 보기 ›
    </button>
  ) : null;

  return (
    <div className={cn('mt-3 px-4 py-3', infoBox)}>
      <div className="flex gap-2.5">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full',
            isPeople
              ? 'bg-secondary-100 text-secondary-600'
              : strong
                ? 'bg-error-50 text-error-500'
                : 'bg-gray-200 text-gray-600',
          )}
          aria-hidden
        >
          {isPeople ? <PeopleIcon /> : <TagIcon />}
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-gray-900">
            <Highlighted text={headline.title} part={strong ? headline.highlight : null} />
          </p>
          {headline.detail ? (
            <p className="mt-0.5 text-xs text-gray-500">{headline.detail}</p>
          ) : null}
          {/* 덧붙일 줄이 없으면 구분선 없이 본문 아래에 — 링크 하나만 떨어져 있으면 빈 칸처럼 보였다. */}
          {!hasFooter && moreButton ? <div className="mt-1.5">{moreButton}</div> : null}
        </div>
      </div>

      {hasFooter ? (
        <div className="mt-2.5 flex items-start gap-3 border-t border-gray-200 pt-2.5 text-xs">
          <div className="min-w-0 flex-1 space-y-1">
            {evidence.support ? (
              <p className="flex items-start gap-1.5 text-gray-600">
                <PeopleIcon className="text-secondary-600 mt-px size-3.5 shrink-0" />
                <span>{evidence.support}</span>
              </p>
            ) : null}
            {evidence.caveat ? (
              <p className="text-warning-700 flex items-start gap-1.5">
                <InfoIcon className="mt-px size-3.5 shrink-0" />
                <span>{evidence.caveat}</span>
              </p>
            ) : null}
          </div>
          {moreButton}
        </div>
      ) : null}
    </div>
  );
}

function Highlighted({ text, part }: { text: string; part?: string | null }) {
  const at = part ? text.indexOf(part) : -1;
  if (!part || at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <b className="text-error-500 font-bold">{part}</b>
      {text.slice(at + part.length)}
    </>
  );
}

function TagIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

function PeopleIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c.6-3.6 3.3-6 6.5-6s5.9 2.4 6.5 6M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.4c1.7.8 2.8 2.9 3 5.6" />
      </g>
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="1.1" fill="currentColor" />
    </svg>
  );
}
