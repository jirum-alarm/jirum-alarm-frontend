import { useRouter, useSearchParams } from 'next/navigation';
import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

const SearchInput = () => {
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get('keyword');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!inputRef.current) return;
    if (event.key === 'Enter') {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('keyword', inputRef.current.value);
      const search = current.toString();
      router.push(`/?${search}`);
    }
  };
  const handleReset = useCallback(() => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.delete('keyword');
    const search = current.toString();
    router.push(`/?${search}`);
  }, []);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.value = keywordParam ?? '';
  }, [keywordParam, searchParams]);

  return (
    <div className="mb-6 drop-shadow-md">
      <div className="mt-6 relative flex items-center w-full h-14 rounded-lg shadow hover:shadow-md bg-white overflow-hidden">
        <div className="grid place-items-center h-full w-14 text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          ref={inputRef}
          className="peer h-full w-full outline-none text-sm text-gray-700 pr-2"
          onKeyDown={onKeyDown}
          spellCheck={false}
          placeholder="최근에 구매하고 싶은 제품이 있으셨나요?"
        />

        <div
          className="grid place-items-center h-full w-14 text-gray-300 cursor-pointer"
          onClick={handleReset}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
