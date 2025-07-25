'use client';

import { Cancel, Home, Search } from '@/components/common/icons';
import BackButton from '@/components/layout/BackButton';
import Link from '@/features/Link';
import { cn } from '@/lib/cn';

import { useSearchInputViewModel } from '../hooks/useSearchInputViewModel';

const SearchInput = ({ show }: { show: boolean }) => {
  const { keyword, onKeyDown, handleChange, handleReset } = useSearchInputViewModel();

  return (
    <>
      <div
        className={cn(
          'flex h-[56px] w-full items-center justify-between gap-x-1 rounded bg-white',
          show
            ? 'flex opacity-100 transition-opacity duration-150'
            : 'pointer-events-none opacity-0 transition-opacity duration-150',
        )}
      >
        <BackButton />
        <div className="flex w-full items-center overflow-hidden rounded bg-gray-50 pl-3 focus-within:outline focus-within:outline-1 focus-within:outline-gray-900">
          <Search color="#98A2B3" className="shrink-0" />
          <input
            value={keyword ?? ''}
            className="h-10 w-full bg-gray-50 px-3 text-sm outline-none"
            onKeyDown={onKeyDown}
            onChange={handleChange}
            spellCheck={false}
            placeholder="핫딜 제품을 검색해 주세요"
            autoFocus
            inputMode="search"
          />

          {keyword && <ResetButton handleReset={handleReset} />}
        </div>
        <Link href="/" className="relative -m-2 cursor-pointer p-2">
          <Home className="relative -right-1" />
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
