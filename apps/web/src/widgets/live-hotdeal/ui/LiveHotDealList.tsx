'use client';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import useAppDownloadLink from '@/shared/hooks/useAppDownloadLink';

import { ProductGridListSkeleton } from '@/entities/product-list/ui/grid';
import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';

import AppDownloadBanner from '@/features/app-download/ui/AppDownloadBanner';

import useLiveHotDealsViewModel from '../hooks/useLiveHotDealsViewModel';

const LiveHotDealList = ({ device }: { device: CheckDeviceResult }) => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();

  const { type, link } = useAppDownloadLink(device);

  const size = device.isMobile ? 4 : 10;

  return (
    <>
      <ProductGridList products={products.slice(0, size)} priorityCount={size} />
      <div className="pc:hidden col-span-2 w-full pt-1 pb-3 sm:col-span-3">
        {type && link && <AppDownloadBanner type={type} link={link} />}
      </div>
      <ProductGridList products={products.slice(size)} />
      <div className="flex w-full items-center justify-center" ref={loadingCallbackRef}>
        {isFetchingNextPage && <ProductGridListSkeleton length={size} />}
      </div>
    </>
  );
};

export default LiveHotDealList;
