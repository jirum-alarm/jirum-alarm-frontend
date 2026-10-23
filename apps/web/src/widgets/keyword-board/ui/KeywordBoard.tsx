'use client';

import { sectionTitle, text } from '@jirum/design-system/recipes';
import {
  KEYWORD_BOARD_COPY,
  keywordBoardSummaryLine,
  sortKeywordBoard,
  summarizeKeywordBoard,
} from '@jirum/domain/keyword-board';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { useState } from 'react';

import type { KeywordBoardItem } from '@/shared/api/keyword';
import { PAGE } from '@/shared/config/page';
import { isGuestAtom, isLoggedInAtom } from '@/shared/hooks/useIsLoggedIn';
import { cn } from '@/shared/lib/cn';
import { usePushChannelPrompt } from '@/shared/lib/push-channel/pushChannel';
import { Skeleton } from '@/shared/ui/common/Skeleton';
import { useToast } from '@/shared/ui/common/Toast';
import Link from '@/shared/ui/Link';

import { AuthQueries } from '@/entities/auth';
import { useUpdateKeyword } from '@/entities/auth/model/update-keyword';
import { findKeywordHubForQuery, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';
import { useKeywordHubs } from '@/entities/keyword-hub/model/useKeywordHubs';

import PushStatusBanner from '@/features/mypage/ui/keyword/PushStatusBanner';

import { useKeywordBoard } from '../model/useKeywordBoard';

import KeywordBoardCard from './KeywordBoardCard';
import RecommendedKeywordChips from './RecommendedKeywordChips';

/** PC 3열 — 첫 줄만 펼친다(나머지는 「키워드 N개 더 보기」). 폰은 가로로 넘겨서 다 본다. */
const PC_VISIBLE = 3;

/** 서버는 키워드를 소문자로 저장한다 — 비교도 소문자·앞뒤 공백 없이. */
const normalize = (keyword: string) => keyword.replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * 키워드 탭 맨 위 «내 키워드 상황판» — 2026-10-23 칩 목록을 카드로 바꿨다. 키워드는 «무엇을 기다리나»의 단위라,
 * 이 탭이 «기다리는 것들이 지금 어떤가»(이번 주 올라온 딜·지금 사기 좋은 딜·키워드별 최근 딜)에 답하게 한다.
 * 푸시를 못 받는 등록자(10/21 실측 74%)에게는 이 상황판이 알림의 전부다. 규칙·문구는 @jirum/domain/keyword-board 한 곳,
 * 숫자는 서버 keywordDealFrequencies(알림과 같은 매칭). 앱 features/keyword-board/ui/KeywordBoard 와 짝.
 * 계정·키워드는 브라우저가 알아서 클라에서 그린다(이 페이지는 캐시되는 공개 화면).
 *
 * 2026-10-23 첫 화면 다이어트: 머리말 상자·알림 띠·한 줄에 하나씩 쌓인 카드가 PC 첫 화면을 다 먹어서, 요약은 제목 아래 한 줄,
 * 알림 띠는 한 줄(compact), 카드는 폰 가로 넘기기·PC 3열 첫 줄만으로 줄였다 — 아래 「지금 사기 좋아요」·키워드 목록이 첫 화면에 보이게.
 */
export default function KeywordBoard() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);
  const isGuest = useAtomValue(isGuestAtom);
  const hasAccount = isLoggedIn || isGuest;
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const promptPushChannel = usePushChannelPrompt();
  const { data, isPending } = useQuery({
    ...AuthQueries.myKeywords({ limit: 20 }),
    enabled: hasAccount,
  });
  const keywords = data?.notificationKeywordsByMe ?? [];
  const names = keywords.map((k) => k.keyword);
  const { data: hubs } = useKeywordHubs();
  const board = useKeywordBoard(names, hasAccount);
  const { mutate: broaden, isPending: broadening } = useUpdateKeyword({
    source: 'mypage_broaden',
    onSuccess: ({ keyword }) => {
      toast.success(`'${keyword}' 키워드 알림도 등록했어요.`);
      promptPushChannel(keyword, 'keyword_tab');
    },
  });

  // 계정이 있는데 아직 받는 중이면 비워 둔다 — 「키워드를 걸어 보세요」가 깜빡였다 사라지면 더 거슬린다.
  if (hasAccount && isPending) return <div className="mb-8 h-20" aria-hidden />;

  if (!hasAccount) {
    return (
      <section className="mb-8 rounded-xl bg-gray-50 px-4 py-4">
        <p className={text.label}>{KEYWORD_BOARD_COPY.guestTitle}</p>
        <p className={cn(text.caption, 'mt-1')}>
          아래 키워드를 눌러 30일 핫딜을 보고, 마음에 들면 그 자리에서 알림을 걸 수 있어요.
        </p>
        <Link
          href={PAGE.MYPAGE_KEYWORD}
          data-track="keyword-tab-register"
          className="bg-primary-500 text-fixed-900 mt-3 inline-block rounded-md px-4 py-2 text-sm font-semibold"
        >
          {KEYWORD_BOARD_COPY.guestCta}
        </Link>
      </section>
    );
  }

  const registered = new Set(names.map(normalize));

  if (keywords.length === 0) {
    return (
      <section className="mb-8 rounded-xl bg-gray-50 px-4 py-4">
        <p className={text.label}>{KEYWORD_BOARD_COPY.emptyTitle}</p>
        <p className={cn(text.caption, 'mt-1 mb-4')}>{KEYWORD_BOARD_COPY.emptyBody}</p>
        <RecommendedKeywordChips registered={registered} wrap />
      </section>
    );
  }

  // 「사흘 안」·「N시간 전」의 기준 시각 — 렌더마다 한 번.
  // eslint-disable-next-line react-hooks/purity -- 클라 컴포넌트, 상대 시각의 기준점
  const now = Date.now();
  const byKeyword = new Map<string, KeywordBoardItem>(
    (board.data ?? []).map((item) => [normalize(item.keyword), item]),
  );
  const items = board.data ? sortKeywordBoard(board.data) : null;
  // 상황판 순서(최근 딜 순)로 내 키워드를 늘어놓고, 상황판에 없는 키워드(조회 실패·초과)는 등록 순으로 뒤에.
  const ordered = items
    ? [
        ...items
          .map((item) => keywords.find((k) => normalize(k.keyword) === normalize(item.keyword)))
          .filter((k): k is (typeof keywords)[number] => !!k),
        ...keywords.filter((k) => !byKeyword.has(normalize(k.keyword))),
      ]
    : keywords;
  const summary = items ? keywordBoardSummaryLine(summarizeKeywordBoard(items)) : null;
  const hiddenOnPc = expanded ? 0 : Math.max(0, ordered.length - PC_VISIBLE);

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className={sectionTitle.page}>{KEYWORD_BOARD_COPY.mineTitle}</h2>
          {summary ? (
            <p className={cn(text.caption, 'mt-0.5')}>
              {summary.emphasis ? (
                <span className="text-error-600 font-semibold">{summary.emphasis} · </span>
              ) : null}
              {summary.text}
            </p>
          ) : board.isPending ? (
            <Skeleton className="mt-1.5 h-3 w-48 rounded" />
          ) : null}
        </div>
        <Link
          href={PAGE.MYPAGE_KEYWORD}
          data-track="keyword-tab-manage"
          className={cn(text.caption, 'mt-1 shrink-0 hover:text-gray-700')}
        >
          {KEYWORD_BOARD_COPY.manage} ›
        </Link>
      </div>
      {/* 받을 통로가 없으면 요약 바로 아래 한 줄 — 키워드를 걸어도 알림이 안 온다. 요약(서비스의 답)이 먼저다. */}
      <PushStatusBanner compact />
      {/* 폰: 가로로 넘기는 카드(다음 카드가 비쳐 보여 넘길 수 있다는 걸 안다). PC: 3열, 첫 줄만. */}
      <ul className="pc:mx-0 pc:grid pc:grid-cols-3 pc:overflow-visible pc:px-0 scrollbar-hide -mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5">
        {ordered.map(({ id, keyword }, index) => {
          const hub = hubs ? findKeywordHubForQuery(keyword, hubs) : undefined;
          const item = byKeyword.get(normalize(keyword)) ?? null;
          const suggested = item?.suggestedKeyword;
          return (
            <KeywordBoardCard
              key={id}
              keyword={keyword}
              item={item}
              pending={board.isPending}
              hubHref={hub ? keywordHubPath(hub) : undefined}
              searchHref={`${PAGE.SEARCH}?keyword=${encodeURIComponent(keyword)}`}
              // 제안 키워드를 이미 갖고 있으면 넓히기를 안 띄운다(등록하면 「이미 등록된 키워드」).
              onBroaden={
                suggested && !registered.has(normalize(suggested))
                  ? (next) => broaden({ keyword: next })
                  : undefined
              }
              broadening={broadening}
              now={now}
              className={cn(
                'pc:w-auto pc:max-w-none w-4/5 max-w-80 shrink-0 snap-start',
                hiddenOnPc > 0 && index >= PC_VISIBLE && 'pc:hidden',
              )}
            />
          );
        })}
      </ul>
      {ordered.length > PC_VISIBLE ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          data-track="keyword-tab-expand"
          className={cn(text.muted, 'pc:block mx-auto mt-3 hidden hover:text-gray-900')}
        >
          {expanded ? KEYWORD_BOARD_COPY.showLess : `${KEYWORD_BOARD_COPY.showMore(hiddenOnPc)} ›`}
        </button>
      ) : null}
      <div className="mt-5">
        <RecommendedKeywordChips registered={registered} />
      </div>
    </section>
  );
}
