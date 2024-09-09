import React, { Suspense } from 'react';

import LiveHotDealList from './LiveHotDealList';

import { IllustStanding } from '@/components/common/icons';

const LiveHotDealContainer = () => {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between pb-5 pt-2">
        <h2 className="text-lg font-semibold text-gray-900">실시간 핫딜</h2>
      </div>
      <div className="pb-5">
        <Suspense fallback={<LiveHotDealListSkeleton />}>
          <LiveHotDealList />
        </Suspense>
      </div>
    </div>
  );
};

export default LiveHotDealContainer;

const LiveHotDealListSkeleton = () => {
  return (
    <div className="grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
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
