import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';
import GridProductListSkeleton from '@/features/products/components/skeleton/GridProductListSkeleton';

import LiveHotDealList from './LiveHotDealList';

const LiveHotDealSection = () => {
  return (
    <div className="px-5 pc:pt-11">
      <SectionHeader title="실시간 핫딜" />
      <ApiErrorBoundary>
        <Suspense fallback={<GridProductListSkeleton length={20} />}>
          <LiveHotDealList />
        </Suspense>
      </ApiErrorBoundary>
    </div>
  );
};

export default LiveHotDealSection;
