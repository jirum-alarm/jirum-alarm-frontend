import { mp } from '@/lib/mixpanel';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

const RECENT_KEYWORDS_KEY = 'gr-recent-keywords';
const RECENT_KEYWORDS_LIMIT = 10;

export const useSearchInputViewModel = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('keyword') ?? '';
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

      mp.track('Product Search', {
        keyword,
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
    router.push(`/search`);
  };

  useEffect(() => {
    if (!inputRef.current) {
      return;
    }

    inputRef.current.value = keyword ?? '';
  }, [keyword]);

  return { inputRef, onKeyDown, handleReset };
};
