'use client';

import { LoadingSpinner } from '@/components/common/icons';
import { ProductLiveHotdealsImageCard, useCollectProduct } from '@/features/products';

import useLiveHotDealsViewModel from '../hooks/useLiveHotDealsViewModel';

import AppDownloadCTA from './AppDownloadCTA';

const LiveHotDealList = () => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();
  const collectProduct = useCollectProduct();

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 6).map((product) => (
          <ProductLiveHotdealsImageCard
            key={product.id}
            product={product}
            collectProduct={collectProduct}
            logging={{ page: 'HOME' }}
          />
        ))}
        <AppDownloadCTA />
        {products.slice(6).map((product) => (
          <ProductLiveHotdealsImageCard
            key={product.id}
            product={product}
            collectProduct={collectProduct}
            logging={{ page: 'HOME' }}
          />
        ))}
      </div>
      <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

export default LiveHotDealList;
