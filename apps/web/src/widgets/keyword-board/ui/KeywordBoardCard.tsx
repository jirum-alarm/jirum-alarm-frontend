'use client';

import { addChip, text } from '@jirum/design-system/recipes';
import { describeKeywordActivity, KEYWORD_BOARD_COPY } from '@jirum/domain/keyword-board';
import { broadenSuggestion } from '@jirum/domain/keyword-frequency';
import { relativeTimeLabel } from '@jirum/domain/relative-time';

import type { KeywordBoardItem } from '@/shared/api/keyword';
import { cn } from '@/shared/lib/cn';
import { Skeleton } from '@/shared/ui/common/Skeleton';
import Link from '@/shared/ui/Link';

import KeywordDealRow from './KeywordDealRow';

/**
 * 내 키워드 카드 한 장 — «이 키워드가 지금 어떤가»: 살아 있는 정도(오늘·이번 주 N건·조용함) + 알림이 잡았을 최근 딜 3건 +
 * 허브면 30일 모음, 아니면 검색으로. 90일 동안 드물면 그 자리에서 넓혀 받기(내 키워드 화면의 제안과 같은 규칙).
 * item 이 없으면(상황판 조회 전·실패) 이름과 길만 그린다 — 키워드 칩이던 자리가 비지 않게. 앱 KeywordBoardCard 와 짝.
 */
export default function KeywordBoardCard({
  keyword,
  item,
  pending,
  hubHref,
  searchHref,
  onBroaden,
  broadening = false,
  now,
  className,
}: {
  keyword: string;
  item: KeywordBoardItem | null;
  pending: boolean;
  hubHref?: string;
  searchHref: string;
  onBroaden?: (keyword: string) => void;
  broadening?: boolean;
  now: number;
  /** 놓일 자리(상황판의 가로 넘기기·PC 격자)가 폭을 정한다. */
  className?: string;
}) {
  const activity = item
    ? describeKeywordActivity(item, relativeTimeLabel(item.lastDealAt as string | null, now), now)
    : null;
  const suggestion = item && onBroaden ? broadenSuggestion(item) : null;

  return (
    <li className={cn('rounded-xl border border-gray-200 px-4 py-3', className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className={cn(text.subtitle, 'truncate')}>{keyword}</h3>
          {activity ? (
            <p
              className={cn(
                text.caption,
                'mt-0.5',
                activity.tone === 'today' && 'text-error-600 font-semibold',
              )}
            >
              {activity.text}
            </p>
          ) : pending ? (
            <Skeleton className="mt-1 h-3 w-32 rounded" />
          ) : null}
        </div>
        <Link
          href={hubHref ?? searchHref}
          data-track={hubHref ? 'keyword-hub-link' : 'keyword-tab-search'}
          data-source="keyword_tab_mine"
          className={cn(text.caption, 'shrink-0 hover:text-gray-700')}
        >
          {hubHref ? KEYWORD_BOARD_COPY.hub : KEYWORD_BOARD_COPY.search} ›
        </Link>
      </div>

      {item && item.recentDeals.length > 0 ? (
        <ul className="mt-1 divide-y divide-gray-100">
          {item.recentDeals.map((deal) => (
            <li key={deal.id}>
              <KeywordDealRow deal={deal} />
            </li>
          ))}
        </ul>
      ) : pending ? (
        <div className="mt-2 flex items-center gap-3 py-2">
          <Skeleton className="h-19 w-19 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-11/12 rounded" />
            <Skeleton className="mt-2 h-3.5 w-1/3 rounded" />
          </div>
        </div>
      ) : null}

      {suggestion && onBroaden ? (
        // 드문 키워드(90일 3번 미만) — 첫 낱말(대개 브랜드)로 넓혀 받기. 원래 키워드는 그대로.
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={text.caption}>{suggestion.text}</span>
          <button
            type="button"
            disabled={broadening}
            onClick={() => onBroaden(suggestion.keyword)}
            className={cn(
              'flex items-center gap-1.5 disabled:opacity-50',
              addChip.box,
              addChip.text,
            )}
          >
            {suggestion.button}
            <span className={addChip.plus}>+</span>
          </button>
        </div>
      ) : null}
    </li>
  );
}
