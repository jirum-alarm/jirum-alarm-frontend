import { BrandItem } from '@/hooks/graphql/brandProduct';

import { VerificationQueries } from './useVerificationQueries';

type Props = {
  searchQuery: string;
  handleSearchChange: (value: string) => void;
  isSearching: boolean;
  debouncedSearchQuery: string;
  allBrandItems: BrandItem[];
  hasBrandItemMore: boolean;
  brandItemSearchTotalCountData: VerificationQueries['brandItemSearchTotalCountData'];
  brandItemsTotalCountData: VerificationQueries['brandItemsTotalCountData'];
  pendingVerificationsTotalCountData: VerificationQueries['pendingVerificationsTotalCountData'];
};

// 좌측 상단: 검색창 + 총/검색결과 건수 + 전체 대기 건수.
const BrandSearchHeader = ({
  searchQuery,
  handleSearchChange,
  isSearching,
  debouncedSearchQuery,
  allBrandItems,
  hasBrandItemMore,
  brandItemSearchTotalCountData,
  brandItemsTotalCountData,
  pendingVerificationsTotalCountData,
}: Props) => (
  <div className="border-b border-stroke p-3 dark:border-strokedark">
    <div className="relative">
      <input
        type="text"
        placeholder="브랜드/상품명 검색..."
        className="w-full rounded-lg border border-stroke bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <svg
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
    <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500">
      <span>
        {isSearching ? (
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 animate-spin rounded-full border border-primary border-t-transparent" />
            검색 중...
          </span>
        ) : debouncedSearchQuery ? (
          <>
            검색결과{' '}
            <span className="font-semibold text-primary">
              {brandItemSearchTotalCountData?.brandItemsByMatchCountTotalCount?.toLocaleString() ??
                allBrandItems.length}
            </span>
            개{hasBrandItemMore && ` · 로드됨 ${allBrandItems.length}개`}
          </>
        ) : (
          <>
            총{' '}
            <span className="font-semibold text-primary">
              {brandItemsTotalCountData?.brandItemsByMatchCountTotalCount?.toLocaleString() ?? '-'}
            </span>
            개 브랜드 아이템
            {hasBrandItemMore && ` · 로드됨 ${allBrandItems.length}개`}
          </>
        )}
      </span>
      <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
        전체 대기{' '}
        {pendingVerificationsTotalCountData?.pendingVerificationsTotalCount?.toLocaleString() ??
          '-'}
        건
      </span>
    </div>
  </div>
);

export default BrandSearchHeader;
