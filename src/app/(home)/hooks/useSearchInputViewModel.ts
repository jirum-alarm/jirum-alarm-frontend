import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const useSearchInputViewModel = () => {
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get('keyword');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;
    if (event.key === 'Enter') {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('keyword', inputRef.current.value);
      const search = current.toString();
      router.replace(`/?${search}`);
    }
  };
  const handleReset = () => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('keyword');
    const search = current.toString();
    router.replace(`/?${search}`);
  };

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.value = keywordParam ?? '';
  }, [keywordParam, searchParams]);
  return { inputRef, onKeyDown, handleReset };
};
