import { Suspense } from 'react';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import HotdealKeywordsTable from './components/HotdealKeywordsTable';
import HotdealKeywordsTableSkeleton from './components/HotdealKeywordsTableSkeleton';
import Link from 'next/link';
import { getAccessToken } from '@/app/actions/token';

const HotDealKeywordPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="flex w-full justify-end">
        <Link
          className="mb-2 rounded-xl bg-lime-400 p-2 text-white"
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
    </DefaultLayout>
  );
};

export default HotDealKeywordPage;
