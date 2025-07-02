'use client';

import { LoadingSpinner } from '@/components/common/icons';
import { ProductLiveHotdealsImageCard, useCollectProduct } from '@/features/products';
import useScreen from '@/hooks/useScreenSize';

import useLiveHotDealsViewModel from '../hooks/useLiveHotDealsViewModel';

import AppDownloadCTA from './AppDownloadCTA';

const LiveHotDealList = () => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();
  const collectProduct = useCollectProduct();
  const { smd, lg } = useScreen();

  const size = lg ? 10 : smd ? 6 : 4;

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 pc:pt-4 sm:grid-cols-3">
        {products.slice(0, size).map((product) => (
          <ProductLiveHotdealsImageCard
            key={product.id}
            product={product}
            collectProduct={collectProduct}
            logging={{ page: 'HOME' }}
          />
        ))}
        <AppDownloadCTA />
        {products.slice(size).map((product) => (
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
