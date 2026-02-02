'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import InitialResult from './InitialResult';
import SearchResult from './SearchResult';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get('keyword');

  return (
    <main>
      <Suspense>
        <InitialResult show={!keywordParam} />
      </Suspense>
      <Suspense>
        <SearchResult show={!!keywordParam} />
      </Suspense>
    </main>
  );
}
