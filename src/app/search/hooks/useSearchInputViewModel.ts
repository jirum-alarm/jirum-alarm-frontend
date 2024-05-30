import { EVENT } from '@/constants/mixpanel';
import { mp } from '@/lib/mixpanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const RECENT_KEYWORDS_KEY = 'gr-recent-keywords';
const RECENT_KEYWORDS_LIMIT = 10;

export const useSearchInputViewModel = () => {
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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
      const urlSearchParams = new URLSearchParams(Array.from(searchParams.entries()));
      urlSearchParams.set('keyword', keyword);
      const search = urlSearchParams.toString();

      router.replace(`/search?${search}`);

      mp.track(EVENT.PRODUCT_SEARCH.NAME, {
        keyword,
        type: EVENT.PRODUCT_SEARCH.TYPE.INPUT,
        page: EVENT.PAGE.SEARCH,
      });

      setRecentKeyord(keyword);
    }
  };
  const handleReset = () => {
    setKeyword('');

    router.push(`/search`);
  };

  useEffect(() => {
    const keyword = searchParams.get('keyword');

    setKeyword(keyword);
    setRecentKeyord(keyword ? keyword : '');
  }, [searchParams]);

  return {
    keyword,
    inputRef,
    onKeyDown,
    handleChange,
    handleReset,
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
