import Link from 'next/link';
import { Suspense } from 'react';

import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import Table from './components/PostReservationsTable';

const PostReservationPage = async () => {
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="flex w-full justify-end">
        <Link
          className="mb-2 rounded-xl bg-lime-400 p-2 text-white"
          href={'/post/reservation/register'}
        >
          추가
        </Link>
      </div>
      <div className="flex gap-3">
        <Suspense fallback={<>Loading...</>}>
          <Table />
        </Suspense>
      </div>
    </DefaultLayout>
  );
};

export default PostReservationPage;
