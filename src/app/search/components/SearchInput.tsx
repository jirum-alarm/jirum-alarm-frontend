'use client';

import Link from 'next/link';
import { useSearchInputViewModel } from '../hooks/useSearchInputViewModel';
import { Cancel, Home } from '@/components/common/icons';
import { cn } from '@/lib/cn';
import { useEffect } from 'react';

const HOME_PATH = '/';

const SearchInput = ({ show }: { show: boolean }) => {
  const { keyword, inputRef, onKeyDown, handleChange, handleReset } = useSearchInputViewModel();

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <>
      <div
        className={cn(
          'fixed z-50  ml-[-20px] flex w-full  max-w-screen-lg items-center justify-between gap-x-3 rounded bg-white px-5 py-4',
          show
            ? 'flex opacity-100 transition-opacity duration-150'
            : 'opacity-0 transition-opacity duration-150',
        )}
      >
        <div className={cn('flex w-full items-center  overflow-hidden rounded bg-gray-50')}>
          <input
            value={keyword ?? ''}
            className="h-10 w-full bg-gray-50 px-3 text-sm  outline-none"
            onKeyDown={onKeyDown}
            onChange={handleChange}
            spellCheck={false}
            autoFocus
            placeholder="&nbsp;&nbsp;핫딜 제품을 검색해 주세요"
            ref={inputRef}
          />
          {keyword && <ResetButton handleReset={handleReset} />}
        </div>
        <Link href={HOME_PATH}>
          <Home />
        </Link>
      </div>
      <div className="h-14"></div>
    </>
  );
};

export default SearchInput;

function ResetButton({ handleReset }: { handleReset: () => void }) {
  return (
    <div
      className="grid h-full w-14 cursor-pointer place-items-center text-gray-300"
      onClick={handleReset}
    >
      <Cancel />
    </div>
  );
}
