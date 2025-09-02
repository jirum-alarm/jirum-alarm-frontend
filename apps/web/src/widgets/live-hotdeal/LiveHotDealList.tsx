'use client';

import { CheckDeviceResult } from '@/app/actions/agent.types';
import { GridProductListSkeleton } from '@/features/products/grid';

import AppDownloadCTA from '@features/banner/items/AppDownloadCTA';
import ProductGridList from '@features/products/grid/GridProductList';

import useLiveHotDealsViewModel from './hooks/useLiveHotDealsViewModel';

const LiveHotDealList = ({ device }: { device: CheckDeviceResult }) => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();

  const size = device.isMobile ? 4 : 10;

  return (
    <>
      <ProductGridList products={products.slice(0, size)} />
      <div className="pc:hidden col-span-2 w-full pt-1 pb-3 sm:col-span-3">
        <AppDownloadCTA device={device} />
      </div>
      <ProductGridList products={products.slice(size)} />
      <div className="flex w-full items-center justify-center" ref={loadingCallbackRef}>
        {isFetchingNextPage && <GridProductListSkeleton length={size} />}
      </div>
    </>
  );
};

export default LiveHotDealList;
