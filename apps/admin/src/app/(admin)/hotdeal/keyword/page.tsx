import Link from 'next/link';
import { Suspense } from 'react';

import HotdealKeywordsTable from './components/HotdealKeywordsTable';
import HotdealKeywordsTableSkeleton from './components/HotdealKeywordsTableSkeleton';

const HotDealKeywordPage = async () => {
  return (
    <>
      <div className="flex w-full justify-end">
        <Link
          className="mb-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          href={'/hotdeal/keyword/register'}
        >
          추가
        </Link>
      </div>
      <div className="flex gap-3">
        <Suspense fallback={<HotdealKeywordsTableSkeleton />}>
          <HotdealKeywordsTable />
        </Suspense>
      </div>
    </>
  );
};

export default HotDealKeywordPage;
