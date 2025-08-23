'use client';

import { CheckDeviceResult } from '@/app/actions/agent.types';
import { LoadingSpinner } from '@/components/common/icons';
import useScreen from '@/hooks/useScreenSize';

import AppDownloadCTA from '@features/banner/items/AppDownloadCTA';
import ProductGridList from '@features/products/grid/GridProductList';

import useLiveHotDealsViewModel from './hooks/useLiveHotDealsViewModel';

const LiveHotDealList = ({ device }: { device: CheckDeviceResult }) => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();
  const { smd, lg } = useScreen();

  const size = lg ? 10 : smd ? 6 : 4;

  return (
    <>
      <ProductGridList products={products.slice(0, size)} />
      <div className="pc:hidden col-span-2 w-full pt-1 pb-3 sm:col-span-3">
        <AppDownloadCTA device={device} />
      </div>
      <ProductGridList products={products.slice(size)} />
      <div
        className="flex w-full items-center justify-center bg-white pt-3 pb-6"
        ref={loadingCallbackRef}
      >
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

export default LiveHotDealList;
