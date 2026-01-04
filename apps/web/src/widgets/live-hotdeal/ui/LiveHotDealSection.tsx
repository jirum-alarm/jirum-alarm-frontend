import { Suspense } from 'react';

import { getQueryClient } from '@/app/(app)/react-query/query-client';
import { checkDevice } from '@/app/actions/agent';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import SectionHeader from '@/shared/ui/SectionHeader';

import { ProductListQueries } from '@/entities/product-list';

import { GridProductListSkeleton } from '@/entities/product-list';

import LiveHotDealList from './LiveHotDealList';

const limit = 20;
interface LiveHotDealSectionProps {
  title?: string;
}

const LiveHotDealSection = async ({ title = '실시간 핫딜' }: LiveHotDealSectionProps) => {
  const device = await checkDevice();

  const queryClient = getQueryClient();

  queryClient.prefetchInfiniteQuery(
    ProductListQueries.infiniteProducts({
      limit,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  return (
    <div className="pc:pt-11 pc:px-0 pc:space-y-10 px-5">
      <SectionHeader title={title} />
      <Suspense fallback={<GridProductListSkeleton length={20} />}>
        <LiveHotDealList device={device} />
      </Suspense>
    </div>
  );
};

export default LiveHotDealSection;
