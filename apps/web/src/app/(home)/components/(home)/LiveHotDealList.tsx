'use client';
import useLiveHotDealsViewModel from '../../hooks/useLiveHotDealsViewModel';

import { LoadingSpinner } from '@/components/common/icons';
import { ProductLiveHotdealsImageCard, useCollectProduct } from '@/features/products';
import AppDownloadCTA from './AppDownloadCTA';
import useScreen from '@/hooks/useScreenSize';

const LiveHotDealList = () => {
  const { products, loadingCallbackRef, isFetchingNextPage } = useLiveHotDealsViewModel();
  const { smd } = useScreen();
  const firstRenderingCount = smd ? 6 : 4;
  const collectProduct = useCollectProduct();

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
        {products
          ?.slice(0, firstRenderingCount)
          .map((product, i) => (
            <ProductLiveHotdealsImageCard
              key={i}
              product={product}
              collectProduct={collectProduct}
              logging={{ page: 'HOME' }}
            />
          ))}
      </div>
      <AppDownloadCTA />
      <div className="mt-[20px] grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
        {products.slice(firstRenderingCount).map((product, i) => (
          <ProductLiveHotdealsImageCard
            key={i}
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
