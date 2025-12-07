'use client';

import { Cancel, Home, Search } from '@/shared/ui/icons';
import Link from '@/shared/ui/Link';

import { useSearchInputViewModel } from '../hooks/useSearchInputViewModel';

const SearchInput = () => {
  const { keyword, onKeyDown, handleChange, handleReset } = useSearchInputViewModel();

  return (
    <div className="flex w-full items-center overflow-hidden rounded-sm bg-gray-50 pl-3 focus-within:outline-1 focus-within:outline-gray-900 focus-within:outline-solid">
      <Search color="#98A2B3" className="shrink-0" />
      <input
        value={keyword ?? ''}
        className="h-10 w-full bg-gray-50 px-3 text-sm outline-hidden"
        onKeyDown={onKeyDown}
        onChange={handleChange}
        spellCheck={false}
        placeholder="핫딜 제품을 검색해 주세요"
        autoFocus
        inputMode="search"
      />

      {keyword && <ResetButton handleReset={handleReset} />}
    </div>
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
