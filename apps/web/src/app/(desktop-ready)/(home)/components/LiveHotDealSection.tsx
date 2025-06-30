import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import { IllustStanding } from '@/components/common/icons';
import SectionHeader from '@/components/SectionHeaderHOC';

import LiveHotDealList from './LiveHotDealList';

const LiveHotDealSection = () => {
  return (
    <div className="px-5 lg:pt-11">
      <SectionHeader title="실시간 핫딜" />
      <div className="flex flex-col gap-y-5 pb-5 lg:pt-4">
        <ApiErrorBoundary>
          <Suspense fallback={<LiveHotDealListSkeleton />}>
            <LiveHotDealList />
          </Suspense>
        </ApiErrorBoundary>
      </div>
    </div>
  );
};

export default LiveHotDealSection;

const LiveHotDealListSkeleton = () => {
  return (
    <div className="grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: 12 }).map((item, i) => (
        <div key={i} className="w-full">
          <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
            <IllustStanding />
          </div>
          <div className="flex flex-col gap-1 pt-2">
            <div className="h-3 bg-gray-100"></div>
            <div className="h-3 w-1/2 bg-gray-100"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
