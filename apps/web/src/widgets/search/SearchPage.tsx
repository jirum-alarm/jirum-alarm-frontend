'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { InitialResult, SearchPageInput, SearchResult } from './components';
import { useInputHideOnScroll } from './hooks/useInputHideOnScroll';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const keywordParam = searchParams.get('keyword');

  const showSearchBar = useInputHideOnScroll();

  return (
    <>
      <header className="sticky left-0 right-0 top-0 z-50 w-full">
        <SearchPageInput show={showSearchBar} />
      </header>
      <div className="w-full">
        <main>
          <Suspense>
            <InitialResult show={!keywordParam} />
          </Suspense>
          <Suspense>
            <SearchResult show={!!keywordParam} />
          </Suspense>
        </main>
      </div>
    </>
  );
}
