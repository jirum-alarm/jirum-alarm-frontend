'use client';
import { ProductLiveHotdealsImageCard, useCollectProduct } from '@/features/products';
import useLiveHotDealsViewModel from '../../hooks/useLiveHotDealsViewModel';
import { LoadingSpinner } from '@/components/common/icons';

const LiveHotDealList = () => {
  const { products, loadingCallbackRef, isPending } = useLiveHotDealsViewModel();
  const collectProduct = useCollectProduct();

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
        {products.map((product, i) => (
          <ProductLiveHotdealsImageCard
            key={i}
            product={product}
            collectProduct={collectProduct}
            logging={{ page: 'HOME' }}
          />
        ))}
      </div>
      <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isPending && <LoadingSpinner />}
      </div>
    </>
  );
};

export default LiveHotDealList;
