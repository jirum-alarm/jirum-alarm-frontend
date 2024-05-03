import { useSearchInputViewModel } from '../hooks/useSearchInputViewModel';

const SearchInput = () => {
  const { inputRef, onKeyDown, handleReset } = useSearchInputViewModel();
  return (
    <div className="mb-4 drop-shadow-md">
      <div className="relative mt-4 flex h-14 w-full items-center overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md">
        <div className="grid h-full w-14 place-items-center text-gray-300">
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
          className="peer h-full w-full pr-2 text-sm text-gray-700 outline-none"
          onKeyDown={onKeyDown}
          spellCheck={false}
          placeholder="최근에 구매하고 싶은 제품이 있으셨나요?"
        />

        <div
          className="grid h-full w-14 cursor-pointer place-items-center text-gray-300"
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
