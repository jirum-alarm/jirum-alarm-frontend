import { Suspense } from 'react';

import { getQueryClient } from '@/app/(app)/react-query/query-client';
import { checkDevice } from '@/app/actions/agent';
import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';

import { OrderOptionType, ProductOrderType } from '@shared/api/gql/graphql';

import { ProductQueries } from '@entities/product';

import GridProductListSkeleton from '@features/products/grid/GridProductListSkeleton';

import LiveHotDealList from './LiveHotDealList';

const limit = 20;
const LiveHotDealSection = async () => {
  const device = await checkDevice();

  const queryClient = getQueryClient();

  queryClient.prefetchInfiniteQuery(
    ProductQueries.infiniteProducts({
      limit,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  return (
    <div className="pc:pt-11 space-y-10 px-5">
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
