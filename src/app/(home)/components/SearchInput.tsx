const SearchInput = () => {
  return (
    <a href="/search">
      <div className="mb-4 rounded bg-gray-50 ">
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
          <div className="flex h-full w-full items-center pr-2 text-sm text-gray-400 outline-none">
            핫딜 제품을 검색해 주세요
          </div>
        </div>
      </div>
    </a>
  );
};

export default SearchInput;
