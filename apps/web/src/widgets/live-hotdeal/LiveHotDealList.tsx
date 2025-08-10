'use client';

import { LoadingSpinner } from '@/components/common/icons';
import useScreen from '@/hooks/useScreenSize';

import AppDownloadCTA from '@features/banner/items/AppDownloadCTA';
import ProductGridList from '@features/products/grid/GridProductList';

import useLiveHotDealsViewModel from './hooks/useLiveHotDealsViewModel';

const LiveHotDealList = () => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();
  const { smd, lg } = useScreen();

  const size = lg ? 10 : smd ? 6 : 4;

  return (
    <>
      <ProductGridList products={products.slice(0, size)} />
      <div className="col-span-2 w-full pb-3 pt-1 pc:hidden sm:col-span-3">
        <AppDownloadCTA />
      </div>
      <ProductGridList products={products.slice(size)} />
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
