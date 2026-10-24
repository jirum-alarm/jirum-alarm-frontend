import { dealRow, infoBox, text } from '@jirum/design-system/recipes';
import { type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { convertToWebp } from '@/shared/lib/utils/image';
import Badge from '@/shared/ui/common/Badge';
import ImageComponent from '@/shared/ui/ImageComponent';

import { type DealsAnswer } from '@/features/deals/lib/model-page-insights';

/** 답 카드 안 딜 한 줄 — 지금 살 수 있는 가장 싼 딜(진행 중일 때). */
export interface AnswerDealRow {
  productId: number;
  title: string;
  thumbnail: string | null;
  /** 「지마켓 · 2일 전」 */
  meta: string | null;
  priceText: string;
  unitText: string | null;
}

/**
 * 「지금 사도 될까?」 바로 아래 답 — 지금 상태(큰 글씨) → 평소와 비교 → 살 기준 → 살 곳(가장 싼 진행 딜·다나와) → 근거.
 * 진행 딜이 없으면 살 곳 대신 알림이 답의 끝이다(다음 핫딜이 올라오면 알려 준다) — 그래서 알림 버튼을 카드 안에 받는다.
 * 문구는 buildDealsAnswer(model-page-insights.ts)가 만들고 여기선 그리기만 한다.
 */
export default function DealsAnswerCard({
  answer,
  activeDealCount,
  deal,
  lastDealHref,
  evidence,
  actions,
  children,
}: {
  answer: DealsAnswer;
  activeDealCount: number;
  deal: AnswerDealRow | null;
  /** 진행 딜이 없을 때 「마지막 핫딜」 줄이 가는 곳. */
  lastDealHref: string | null;
  /** 판정 근거 줄(어느 구성·몇 점의 추이·어떤 비교에서 나온 답인지). */
  evidence: ReactNode;
  /** 다나와 최저가 보기·진행 중 모두 보기. */
  actions: ReactNode;
  /** 카드 맨 끝 — 진행 딜이 없을 때의 알림 버튼. */
  children?: ReactNode;
}) {
  const { badge, headline, detail, compare, guide } = answer;
  return (
    <section aria-label="지금 사도 될까" className={cn('mb-6 p-4', infoBox)}>
      {(badge || activeDealCount > 0) && (
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {badge && (
            <Badge pill tone={badge.tone}>
              {badge.label}
            </Badge>
          )}
          {activeDealCount > 0 && <span className={text.caption}>진행 중 {activeDealCount}건</span>}
        </div>
      )}
      <p className={text.title}>{headline}</p>
      {detail &&
        (lastDealHref ? (
          <a
            href={lastDealHref}
            className={cn(text.muted, 'mt-0.5 inline-block underline-offset-2 hover:underline')}
          >
            {detail} ›
          </a>
        ) : (
          <p className={cn(text.muted, 'mt-0.5')}>{detail}</p>
        ))}
      {(compare || guide) && (
        <div className="mt-2 flex flex-col gap-0.5">
          {compare && <p className={text.body}>{compare}</p>}
          {guide && <p className={text.body}>{guide}</p>}
        </div>
      )}

      {deal && (
        <a
          href={`/products/${deal.productId}`}
          className={cn('mt-3 flex items-center gap-3 bg-white', dealRow)}
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-50">
            {deal.thumbnail && (
              <ImageComponent
                src={convertToWebp(deal.thumbnail) ?? deal.thumbnail}
                fallbackSrc={deal.thumbnail}
                alt={deal.title}
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm text-gray-900">{deal.title}</p>
            {deal.meta && <p className={cn(text.caption, 'mt-0.5 truncate')}>{deal.meta}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className={text.label}>{deal.priceText}</span>
            {deal.unitText && <span className={text.caption}>{deal.unitText}</span>}
          </div>
        </a>
      )}

      {evidence}
      {actions}
      {children}
    </section>
  );
}
