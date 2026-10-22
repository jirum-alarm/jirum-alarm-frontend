'use client';

import { text } from '@jirum/design-system/recipes';
import Link from 'next/link';
import { useEffect } from 'react';

import { cn } from '@/shared/lib/cn';

import {
  buildKeywordHubFacts,
  findKeywordHubForQuery,
  formatHubCount,
  keywordHubPath,
} from '@/entities/keyword-hub/lib/keyword-hub';
import { useKeywordHubs } from '@/entities/keyword-hub/model/useKeywordHubs';

import { pushDataLayer } from '../hooks/useSearchKeywordAlert';

/**
 * 검색어가 키워드 허브 자체일 때("삼다수", "플스5") 결과 위에 허브 요약을 한 줄 띄운다 — "최근 30일 76건 · 평균 하루 2.5건 ·
 * 주로 뽐뿌(62%)". 검색으로 오는 사람이 허브보다 훨씬 많아(GA4 페이지뷰) 허브가 가진
 * "얼마나 자주·어디에 올라오나"를 가장 많은 사람에게 보여주는 자리다. 허브는 30일 요약, 검색은 전 기간·필터라 대체하지 않는다.
 * 포함이 아니라 같은 검색어만 — "삼다수 2L" 처럼 좁힌 검색은 검색 결과가 더 맞다.
 */
export default function SearchKeywordHubCard({ keyword }: { keyword: string }) {
  const { data: hubs } = useKeywordHubs();
  const hub = hubs ? findKeywordHubForQuery(keyword, hubs) : undefined;
  const show = !!hub && hub.recentDealCount > 0;

  useEffect(() => {
    if (!show || !hub) return;
    pushDataLayer({ event: 'keyword_hub_card_view', keyword: hub.slug, placement: 'search_bar' });
  }, [show, hub]);

  if (!show || !hub) return null;

  const facts = buildKeywordHubFacts(hub);
  return (
    <Link
      href={keywordHubPath(hub)}
      onClick={() =>
        pushDataLayer({
          event: 'keyword_hub_card_click',
          keyword: hub.slug,
          placement: 'search_bar',
        })
      }
      className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-gray-300 hover:bg-gray-50"
    >
      <div className="min-w-0">
        <p className={cn(text.label, 'truncate')}>{hub.name} 핫딜 모음</p>
        <p className={cn(text.caption, 'mt-0.5 truncate')}>
          {[`최근 30일 ${formatHubCount(hub)}`, ...facts].join(' · ')}
        </p>
      </div>
      <span className={cn(text.muted, 'shrink-0')} aria-hidden>
        →
      </span>
    </Link>
  );
}
