import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';

import GridProductListSkeleton from '@features/products/grid/GridProductListSkeleton';

import LiveHotDealList from './LiveHotDealList';

const LiveHotDealSection = () => {
  return (
    <div className="pc:pt-11 px-5">
      <SectionHeader title="실시간 핫딜" />
      <div className="h-15" />
      <ApiErrorBoundary>
        <Suspense fallback={<GridProductListSkeleton length={20} />}>
          <LiveHotDealList />
        </Suspense>
      </ApiErrorBoundary>
    </div>
  );
};

export default LiveHotDealSection;
