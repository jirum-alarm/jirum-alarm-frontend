import { EVENT } from '@/constants/mixpanel';
import { mp } from '@/lib/mixpanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const RECENT_KEYWORDS_KEY = 'gr-recent-keywords';
const RECENT_KEYWORDS_LIMIT = 10;

export const useSearchInputViewModel = () => {
  const [isKeywordExist, setIsKeywordExsit] = useState(false);

  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.currentTarget.value ? setIsKeywordExsit(true) : setIsKeywordExsit(false);
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

      mp.track(EVENT.productSearch.name, {
        keyword,
        type: EVENT.productSearch.type.input,
        page: EVENT.page.search,
      });

      const recentKeywords = JSON.parse(
        localStorage.getItem(RECENT_KEYWORDS_KEY) ?? '[]',
      ) as unknown as string[];

      if (recentKeywords.includes(keyword)) {
        return;
      }

      recentKeywords.unshift(keyword);

      localStorage.setItem(
        RECENT_KEYWORDS_KEY,
        JSON.stringify(recentKeywords.slice(0, RECENT_KEYWORDS_LIMIT)),
      );
    }
  };
  const handleReset = () => {
    if (inputRef.current?.value) {
      inputRef.current.value = '';
    }

    setIsKeywordExsit(false);
    router.push(`/search`);
  };

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.value = keyword ?? '';
  }, [keyword]);

  return { inputRef, isKeywordExist, onKeyDown, handleChange, handleReset };
};
