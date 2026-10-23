import {KEYWORD_BOARD_RECENT_LIMIT} from '@jirum/domain/keyword-board';
import {useQuery} from '@tanstack/react-query';

import {MyPageService} from '@/shared/api/mypage';

/** 서버가 한 번에 받는 수(내 키워드 상한과 같다). */
const MAX_KEYWORDS = 20;

const normalize = (keyword: string) => keyword.replace(/\s+/g, ' ').trim();

export type KeywordBoardItem = Awaited<
  ReturnType<typeof MyPageService.getKeywordBoard>
>[number];
export type KeywordBoardDeal = KeywordBoardItem['recentDeals'][number];

/**
 * 키워드 탭 상황판 — 내 키워드마다 90일·7일 건수·최근 딜 3건(서버 keywordDealFrequencies, 알림과 같은 매칭).
 * 최근 딜은 서버가 10분 캐시라 5분이면 새 딜이 늦지 않게 따라온다. 실패하면 카드가 이름·길만 그린다.
 * web widgets/keyword-board/model/useKeywordBoard 와 같은 규칙.
 */
export function useKeywordBoard(keywords: string[], enabled = true) {
  const list = [...new Set(keywords.map(normalize).filter(Boolean))]
    .slice(0, MAX_KEYWORDS)
    .sort();
  return useQuery({
    queryKey: ['keyword-board', KEYWORD_BOARD_RECENT_LIMIT, ...list],
    queryFn: () =>
      MyPageService.getKeywordBoard(list, KEYWORD_BOARD_RECENT_LIMIT),
    enabled: enabled && list.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
