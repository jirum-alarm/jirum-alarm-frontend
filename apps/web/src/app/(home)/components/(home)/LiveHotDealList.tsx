import { ProductImageCard, useCollectProduct } from '@/features/products';
import React from 'react';
import useLiveHotDealsViewModel from '../../hooks/useLiveHotDealsViewModel';
import { LoadingSpinner } from '@/components/common/icons';

const LiveHotDealList = () => {
  const { products, loadingCallbackRef, isPending } = useLiveHotDealsViewModel();
  const collectProduct = useCollectProduct();

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 pb-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
        {products.map((product, i) => (
          <ProductImageCard
            key={i}
            product={product}
            collectProduct={collectProduct}
            logging={{ page: 'HOME' }}
          />
        ))}
      </div>

      <div className="mt-3 flex w-full items-center justify-center pb-4" ref={loadingCallbackRef}>
        {isPending && <LoadingSpinner />}
      </div>
    </>
  );
};

export default LiveHotDealList;
