'use client';

import { LoadingSpinner } from '@/components/common/icons';
import ProductGridList from '@/features/products/components/grid/ProductGridList';
import useScreen from '@/hooks/useScreenSize';

import useLiveHotDealsViewModel from '../hooks/useLiveHotDealsViewModel';

import AppDownloadCTA from './AppDownloadCTA';

const LiveHotDealList = () => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();
  const { smd, lg } = useScreen();

  const size = lg ? 10 : smd ? 6 : 4;

  return (
    <>
      <ProductGridList products={products.slice(0, size)} loggingPage={'HOME'} />
      <div className="col-span-2 w-full pb-3 pt-1 pc:hidden sm:col-span-3">
        <AppDownloadCTA />
      </div>
      <ProductGridList products={products.slice(size)} loggingPage={'HOME'} />
      <div
        className="flex w-full items-center justify-center bg-white pb-6 pt-3"
        ref={loadingCallbackRef}
      >
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

export default LiveHotDealList;
