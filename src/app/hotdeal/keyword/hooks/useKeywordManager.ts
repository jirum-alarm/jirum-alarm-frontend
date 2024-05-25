import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const SYNONYM = 'synonym';

const useKeywordManager = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    const queryKeywords = searchParams.getAll(SYNONYM);
    setKeywords(queryKeywords);
  }, [searchParams]);

  const updateSearchParams = (keywords: string[]) => {
    const params = new URLSearchParams();
    keywords.forEach((k) => params.append(SYNONYM, k));
    router.push(`${pathname}/?${params.toString()}`);
  };

  const addKeyword = (keyword: string) => {
    if (keywords.some((tag) => tag === keyword)) {
      console.log('해당 키워드가 존재합니다.');
      return;
    }
    const _keywords = keywords.concat(keyword);
    updateSearchParams(_keywords);
    setKeywords(_keywords);
  };

  const removeKeyword = (keyword: string) => {
    const filteredKeywords = keywords.filter((_keyword) => _keyword !== keyword);
    updateSearchParams(filteredKeywords);
    setKeywords(filteredKeywords);
  };

  return { keywords, addKeyword, removeKeyword };
};

export default useKeywordManager;
