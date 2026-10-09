import { Dispatch, SetStateAction } from 'react';

import { VerificationQueries } from './useVerificationQueries';

type Props = {
  pendingVerificationsTotalCountByBrandProductData: VerificationQueries['pendingVerificationsTotalCountByBrandProductData'];
  stats: { total: number; selected: number; deselected: number };
  isSimilarOpen: boolean;
  setIsSimilarOpen: Dispatch<SetStateAction<boolean>>;
  includeVerified: boolean;
  setIncludeVerified: (value: boolean) => void;
};

// 우측 통계(전체/승인/거절) + 유사 딜 찾기 토글 + "대기만" 필터.
const VerificationStatsBar = ({
  pendingVerificationsTotalCountByBrandProductData,
  stats,
  isSimilarOpen,
  setIsSimilarOpen,
  includeVerified,
  setIncludeVerified,
}: Props) => (
  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-b border-stroke bg-white px-3 py-1 dark:border-strokedark dark:bg-boxdark">
    <div className="flex items-center gap-3 text-[11px]">
      <span className="text-gray-500 dark:text-gray-400">
        전체{' '}
        <span className="font-bold text-black dark:text-white">
          {pendingVerificationsTotalCountByBrandProductData?.pendingVerificationsTotalCount ??
            stats.total}
        </span>
      </span>
      <span className="text-success">
        승인 <span className="font-bold">{stats.selected}</span>
      </span>
      <span className="text-danger">
        거절 <span className="font-bold">{stats.deselected}</span>
      </span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsSimilarOpen((v) => !v)}
        className={`rounded px-2 py-1.5 text-[11px] font-medium sm:py-0.5 ${
          isSimilarOpen ? 'bg-primary text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
      >
        유사 딜 찾기
      </button>
      <label className="flex cursor-pointer items-center gap-1.5 py-1 text-[11px] text-gray-500 dark:text-gray-400">
        <input
          type="checkbox"
          checked={!includeVerified}
          onChange={(e) => setIncludeVerified(!e.target.checked)}
          className="h-3.5 w-3.5 rounded-sm border-gray-300 text-blue-500 focus:ring-blue-500"
        />
        <span className={!includeVerified ? 'font-medium text-blue-600 dark:text-blue-400' : ''}>
          대기만
        </span>
      </label>
    </div>
  </div>
);

export default VerificationStatsBar;
