'use client';

import { Cancel, Home } from '@/components/common/icons';
import BackButton from '@/components/layout/BackButton';
import Link from '@/features/Link';
import { cn } from '@/lib/cn';

import { useSearchInputViewModel } from '../../hooks/(search)/useSearchInputViewModel';

const SearchInput = ({ show }: { show: boolean }) => {
  const { keyword, onKeyDown, handleChange, handleReset } = useSearchInputViewModel();

  return (
    <>
      <div
        className={cn(
          'flex w-full items-center justify-between gap-x-3 rounded bg-white px-5 py-4',
          show
            ? 'flex opacity-100 transition-opacity duration-150'
            : 'opacity-0 transition-opacity duration-150',
        )}
      >
        <BackButton />
        <div className="flex w-full items-center overflow-hidden rounded bg-gray-50 pl-3">
          <div className="h-6">
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
            value={keyword ?? ''}
            className="h-10 w-full bg-gray-50 px-3 text-sm  outline-none"
            onKeyDown={onKeyDown}
            onChange={handleChange}
            spellCheck={false}
            placeholder="&nbsp;&nbsp;핫딜 제품을 검색해 주세요"
            autoFocus
            inputMode="search"
          />

          {keyword && <ResetButton handleReset={handleReset} />}
        </div>
        <Link href="/" className="cursor-pointer">
          <Home />
        </Link>
      </div>
    </>
  );
};

export default SearchInput;

function ResetButton({ handleReset }: { handleReset: () => void }) {
  return (
    <Link
      className="grid h-full w-14 cursor-pointer place-items-center text-gray-300"
      href="/search"
      onClick={handleReset}
    >
      <Cancel />
    </Link>
  );
}
