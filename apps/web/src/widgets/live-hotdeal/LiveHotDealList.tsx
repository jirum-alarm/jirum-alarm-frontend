'use client';

import useAppDownloadLink from '@/shared/hooks/useAppDownloadLink';
import { CheckDeviceResult } from '@/shared/types/agent';

import { AppDownloadCTA } from '@/features/banner';
import { GridProductListSkeleton } from '@/features/product-list/grid';
import ProductGridList from '@/features/product-list/grid/GridProductList';

import useLiveHotDealsViewModel from './hooks/useLiveHotDealsViewModel';

const LiveHotDealList = ({ device }: { device: CheckDeviceResult }) => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();

  const { type, link } = useAppDownloadLink(device);

  const size = device.isMobile ? 4 : 10;

  return (
    <>
      <ProductGridList products={products.slice(0, size)} />
      <div className="pc:hidden col-span-2 w-full pt-1 pb-3 sm:col-span-3">
        {type && link && <AppDownloadCTA type={type} link={link} />}
      </div>
      <ProductGridList products={products.slice(size)} />
      <div className="flex w-full items-center justify-center" ref={loadingCallbackRef}>
        {isFetchingNextPage && <GridProductListSkeleton length={size} />}
      </div>
    </>
  );
};

export default LiveHotDealList;
