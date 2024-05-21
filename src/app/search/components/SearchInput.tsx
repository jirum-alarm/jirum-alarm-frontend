'use client';

import { useSearchInputViewModel } from '../hooks/useSearchInputViewModel';
import { Cancel, Home } from '@/components/common/icons';

const HOME_PATH = '/';

const SearchInput = () => {
  const { inputRef, onKeyDown, handleReset } = useSearchInputViewModel();

  return (
    <div className="flex items-center justify-between gap-x-3 py-2">
      <div className="flex w-full items-center  overflow-hidden rounded bg-gray-50 ">
        <input
          className="h-10 w-full bg-gray-50 px-3 text-sm  outline-none"
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoFocus
          placeholder="&nbsp;&nbsp;핫딜 제품을 검색해 주세요"
          ref={inputRef}
        />
        <ResetButton handleReset={handleReset} />
      </div>
      <a href={HOME_PATH}>
        <Home />
      </a>
    </div>
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
