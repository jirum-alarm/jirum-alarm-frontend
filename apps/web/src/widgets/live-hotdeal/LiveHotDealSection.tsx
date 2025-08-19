import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';
import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';

import GridProductListSkeleton from '@features/products/grid/GridProductListSkeleton';

import LiveHotDealList from './LiveHotDealList';

const LiveHotDealSection = async () => {
  const device = await checkDevice();
  return (
    <div className="pc:pt-11 px-5">
      <SectionHeader title="실시간 핫딜" />
      <ApiErrorBoundary>
        <Suspense fallback={<GridProductListSkeleton length={20} />}>
          <LiveHotDealList device={device} />
        </Suspense>
      </ApiErrorBoundary>
    </div>
  );
};

export default LiveHotDealSection;
