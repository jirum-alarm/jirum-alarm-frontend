'use client';

import { ESTIMATED_TOTAL_CAP } from '@jirum/domain/search';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ProductQueries } from '@/entities/product';

import { pushDataLayer } from '../hooks/useSearchKeywordAlert';

/**
 * 진짜 0건(필터 없음·종료 제외)일 때 같은 검색어를 종료 포함으로 한 번 더 세어, 있으면 "종료된 딜 N건 보기".
 *
 * 검색은 기본으로 종료(품절) 딜을 빼서, 지난 딜만 있는 검색어도 "결과 없음"으로 끝났다. 가격 이력·지난 딜을
 * 보러 온 사람에겐 막다른 길이다. 누르면 필터 바의 '품절 포함'을 켠 것과 같다(URL ?ended=true 에도 남는다).
 * 건수는 응답 행에 실려 오는 estimatedTotal(첫 행). 지금 진행 중인 딜이 0건이므로 종료 포함 총량 = 종료된 딜 수.
 */
export default function EndedDealsRescue({
  keyword,
  onShowEnded,
}: {
  keyword: string;
  onShowEnded: () => void;
}) {
  // limit 은 목록과 같은 20 — 서버가 검색 엔진에서 limit 만큼 받은 뒤 걸러 내서, 1로 물으면 첫 행이 걸러질 때 0건으로 오판한다(실측).
  const variables = { limit: 20, keyword, isEnd: true };
  const { data } = useQuery({
    ...ProductQueries.products(variables),
    // '품절 포함' 목록(무한 쿼리)과 변수가 같아 키가 겹친다 — 데이터 모양이 달라 꼬리표로 가른다.
    queryKey: [...ProductQueries.products(variables).queryKey, 'ended-count'],
    enabled: !!keyword,
    staleTime: 1000 * 60,
  });

  const first = data?.products[0] as { estimatedTotal?: number | null } | undefined;
  const count = first?.estimatedTotal ?? null;
  const hasEnded = !!first;

  useEffect(() => {
    if (!hasEnded) return;
    pushDataLayer({ event: 'search_ended_rescue_view', keyword, count });
  }, [hasEnded, keyword, count]);

  if (!hasEnded) return null;

  const handleClick = () => {
    pushDataLayer({ event: 'search_ended_rescue_click', keyword, count });
    onShowEnded();
  };

  const countLabel =
    count != null && count > 0
      ? ` ${count.toLocaleString()}건${count >= ESTIMATED_TOTAL_CAP ? '+' : ''}`
      : '';

  return (
    <div className="pc:mx-0 mx-5 flex items-center gap-x-3 rounded-xl bg-gray-50 py-2 pr-2 pl-4">
      <p className="min-w-0 flex-1 text-sm text-gray-700">진행 중인 딜은 없어요</p>
      <button
        type="button"
        onClick={handleClick}
        className="flex h-9 shrink-0 items-center rounded-lg border border-gray-300 bg-white px-3 text-sm font-semibold text-gray-900"
      >
        종료된 딜{countLabel} 보기
      </button>
    </div>
  );
}
