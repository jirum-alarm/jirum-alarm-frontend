'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useDevice } from '@/shared/hooks/useDevice';
import useMyRouter from '@/shared/hooks/useMyRouter';

const RECENT_KEYWORDS_KEY = 'gr-recent-keywords';
const RECENT_KEYWORDS_LIMIT = 10;

export const useSearchInputViewModel = () => {
  const searchParams = useSearchParams();
  const router = useMyRouter();

  const keywordParam = searchParams.get('keyword');

  const [keyword, setKeyword] = useState(keywordParam);
  // URL 의 검색어가 바뀌면(뒤로 가기·칩 클릭) 입력창을 그 값으로 맞춘다 — effect 대신 렌더 중 비교로.
  const [syncedKeywordParam, setSyncedKeywordParam] = useState(keywordParam);
  if (keywordParam !== syncedKeywordParam) {
    setSyncedKeywordParam(keywordParam);
    setKeyword(keywordParam);
  }

  const {
    device: { isJirumAlarmApp },
  } = useDevice();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.currentTarget.value;

    setKeyword(value);

    if (value === '') {
      if (!isJirumAlarmApp) {
        router.replace('/search');
      }
    }
  };

  const submitKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (!trimmed) return;
    // 새 키워드 검색 시 필터·정렬 리셋은 의도된 동작 — 새 검색=새 의도, 잔존 필터로 0건 함정 방지
    // (2026-07-22 디자인 리뷰 결정 6A).
    router.replace(`/search?keyword=${encodeURIComponent(trimmed)}`);
    setRecentKeyord(trimmed);
    setKeyword(trimmed);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyword = event.currentTarget.value;
    if (!keyword) return;
    if (event.key === 'Enter') {
      submitKeyword(keyword);
    }
  };
  const handleReset = () => {
    setKeyword('');
    if (!isJirumAlarmApp) {
      router.replace('/search');
    }
  };

  const handleGoHome = () => {
    router.replace(`/`);
  };

  // 최근 검색어 저장은 localStorage(외부) 쓰기라 effect 에 남긴다.
  useEffect(() => {
    setRecentKeyord(keywordParam ? keywordParam : '');
  }, [keywordParam]);

  return {
    keyword,
    onKeyDown,
    handleChange,
    handleReset,
    handleGoHome,
    submitKeyword,
  };
};

function setRecentKeyord(keyword: string) {
  if (!keyword.trim()) {
    return;
  }

  const recentKeywords = JSON.parse(
    localStorage.getItem(RECENT_KEYWORDS_KEY) ?? '[]',
  ) as unknown as string[];

  if (recentKeywords.includes(keyword)) {
    const existKeywordIndex = recentKeywords.indexOf(keyword);
    recentKeywords.splice(existKeywordIndex, 1);
  }

  recentKeywords.unshift(keyword);

  localStorage.setItem(
    RECENT_KEYWORDS_KEY,
    JSON.stringify(recentKeywords.slice(0, RECENT_KEYWORDS_LIMIT)),
  );
}
