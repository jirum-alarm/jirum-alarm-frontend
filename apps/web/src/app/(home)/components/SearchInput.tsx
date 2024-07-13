import { useDevice } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';
import { useCallback, useEffect, useState } from 'react';

const SearchInput = ({ goSearchPage }: { goSearchPage: () => void }) => {
  const [mounted, setMounted] = useState(false);

  const { isMobile } = useDevice();

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      const isInputEvent = event.target && (event.target as HTMLInputElement).tagName === 'INPUT';
      if (event.key === '/' && !isInputEvent) {
        event.preventDefault();
        goSearchPage();
      }
    },
    [goSearchPage],
  );

  useEffect(() => {
    setMounted(true);

    !isMobile && document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress, isMobile]);

  return (
    <div onClick={goSearchPage} className="mb-4 cursor-pointer rounded bg-gray-50">
      <div className="relative mt-4 flex w-full items-center overflow-hidden">
        <div className="grid h-10 w-14 place-items-center text-gray-600">
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
        <div className="text-sm flex h-full w-full items-center pr-2 text-gray-400 outline-none">
          핫딜 제품을 검색해 주세요
        </div>
        <div
          className={cn(
            'mr-2 hidden h-[24px] w-[24px] items-center justify-center rounded-[4px] bg-gray-200 text-center text-[15px] leading-[20px] text-gray-400',
            mounted && !isMobile && 'flex',
          )}
        >
          /
        </div>
      </div>
    </div>
  );
};

export default SearchInput;
