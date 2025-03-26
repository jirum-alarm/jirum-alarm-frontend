import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import useMyRouter from '@/hooks/useMyRouter';

const RECENT_KEYWORDS_KEY = 'gr-recent-keywords';
const RECENT_KEYWORDS_LIMIT = 10;

export const useSearchInputViewModel = () => {
  const searchParams = useSearchParams();
  const router = useMyRouter();

  const keywordParam = searchParams.get('keyword');

  const [keyword, setKeyword] = useState(keywordParam);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event?.currentTarget.value;

    setKeyword(value);

    if (value === '') {
      router.push('/search');
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const keyword = event.currentTarget.value;

    if (!keyword) {
      return;
    }

    if (event.key === 'Enter') {
      router.push(`/search?keyword=${keyword}`);

      // TODO: Need GTM Migration
      // mp?.track(EVENT.PRODUCT_SEARCH.NAME, {
      //   keyword,
      //   type: EVENT.PRODUCT_SEARCH.TYPE.INPUT,
      //   page: EVENT.PAGE.SEARCH,
      // });

      setRecentKeyord(keyword);
    }
  };
  const handleReset = () => {
    setKeyword('');

    router.push(`/search`);
  };

  const handleGoHome = () => {
    router.replace(`/`);
  };

  useEffect(() => {
    const keyword = searchParams.get('keyword');

    setKeyword(keyword);
    setRecentKeyord(keyword ? keyword : '');
  }, [searchParams]);

  return {
    keyword,
    onKeyDown,
    handleChange,
    handleReset,
    handleGoHome,
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
