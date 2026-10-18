import { useQuery } from '@tanstack/react-query';

import { KeywordFrequencyService } from '@/shared/api/keyword';

import type { KeywordFrequency } from '@jirum/domain/keyword-frequency';

/** 서버가 한 번에 받는 수(내 키워드 상한과 같다). */
const MAX_KEYWORDS = 20;

const normalize = (keyword: string) => keyword.replace(/\s+/g, ' ').trim();

/**
 * 키워드별 지난 90일 횟수 — 내 키워드 목록·입력칸 미리보기. 서버가 키워드마다 6시간 캐시하고 90일 횟수는 몇 시간에 하나 남짓
 * 바뀌어 30분 신선하게 둔다. 실패하면 조용히 없음(미리보기는 등록을 막지 않는다).
 */
export function useKeywordFrequencies(keywords: string[], enabled = true) {
  const list = [...new Set(keywords.map(normalize).filter(Boolean))].slice(0, MAX_KEYWORDS).sort();
  const { data } = useQuery({
    queryKey: ['keyword-frequency', ...list],
    queryFn: () => KeywordFrequencyService.frequencies(list),
    enabled: enabled && list.length > 0,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
  const byKeyword = new Map<string, KeywordFrequency>(
    (data ?? []).map((f) => [f.keyword.toLowerCase(), f]),
  );
  return (keyword: string) => byKeyword.get(normalize(keyword).toLowerCase()) ?? null;
}
