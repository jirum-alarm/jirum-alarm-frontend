'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { InitialResult, SearchResult } from './components';

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
