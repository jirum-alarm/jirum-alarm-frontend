import {useCallback, useEffect, useState} from 'react';

import {
  addRecentKeyword,
  loadRecentKeywords,
  RECENT_KEYWORDS_LIMIT,
  removeRecentKeyword,
  saveRecentKeywords,
} from '../lib/recent-keywords';

/**
 * 최근 검색어 목록. web: RecentKeywords + useSearchInputViewModel.setRecentKeyord
 *
 * ★web 은 localStorage 를 렌더 중 동기로 읽지만 AsyncStorage 는 비동기다 →
 * 메모리 state 를 정본으로 두고 쓸 때마다 디스크로 미러링한다
 * (shared/lib/alarm-unread-snapshot.ts 와 같은 처방).
 *
 * ★검색 화면에 **한 인스턴스만** 둔다. 입력창(저장)과 초기 화면(표시)이 서로
 * 다른 훅 인스턴스를 들면 방금 검색한 말이 목록에 안 뜬다.
 */
export function useRecentKeywords() {
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    loadRecentKeywords().then(stored => {
      // ★로드가 늦게 도착해도 그 사이 넣은 검색어를 덮지 않는다. 딥링크로
      // 들어오면 마운트 직후 저장이 일어나 이 경합이 실제로 생긴다.
      if (alive) {
        setKeywords(prev =>
          prev.length === 0
            ? stored
            : [...prev, ...stored.filter(k => !prev.includes(k))].slice(
                0,
                RECENT_KEYWORDS_LIMIT,
              ),
        );
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const push = useCallback((keyword: string) => {
    setKeywords(prev => {
      const next = addRecentKeyword(prev, keyword);
      // saveRecentKeywords 는 내부에서 실패를 삼킨다(reject 하지 않는다).
      saveRecentKeywords(next);
      return next;
    });
  }, []);

  const remove = useCallback((keyword: string) => {
    setKeywords(prev => {
      const next = removeRecentKeyword(prev, keyword);
      // saveRecentKeywords 는 내부에서 실패를 삼킨다(reject 하지 않는다).
      saveRecentKeywords(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setKeywords([]);
    saveRecentKeywords([]);
  }, []);

  return {keywords, push, remove, clear};
}
