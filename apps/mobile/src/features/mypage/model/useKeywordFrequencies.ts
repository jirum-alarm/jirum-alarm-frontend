import {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import type {KeywordFrequency} from '@jirum/domain/keyword-frequency';

import {MyPageService} from '@/shared/api/mypage';

/** 서버가 한 번에 받는 수(내 키워드 상한과 같다). */
const MAX_KEYWORDS = 20;

const normalize = (keyword: string) => keyword.replace(/\s+/g, ' ').trim();

/**
 * 키워드별 지난 90일 횟수 — 내 키워드 목록·입력칸 미리보기. web `useKeywordFrequencies` 와 같은 규칙:
 * 서버가 키워드마다 6시간 캐시하고 90일 횟수는 몇 시간에 하나 남짓 바뀌어 30분 신선하게 둔다.
 * 실패하면 조용히 없음(미리보기는 등록을 막지 않는다).
 */
export function useKeywordFrequencies(keywords: string[], enabled = true) {
  const list = [...new Set(keywords.map(normalize).filter(Boolean))]
    .slice(0, MAX_KEYWORDS)
    .sort();
  const {data} = useQuery({
    queryKey: ['keyword-frequency', ...list],
    queryFn: () => MyPageService.getKeywordFrequencies(list),
    enabled: enabled && list.length > 0,
    staleTime: 30 * 60 * 1000,
    retry: false,
  });
  const byKeyword = new Map<string, KeywordFrequency>(
    (data ?? []).map(f => [f.keyword.toLowerCase(), f as KeywordFrequency]),
  );
  return (keyword: string) =>
    byKeyword.get(normalize(keyword).toLowerCase()) ?? null;
}

/** 입력이 멈춘 뒤에만 미리보기를 묻는다 — 글자마다 서버를 부르지 않게. */
export function useSettledValue(value: string, delayMs: number) {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return settled;
}
