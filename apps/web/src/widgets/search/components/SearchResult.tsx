import { Suspense } from 'react';

import { cn } from '@shared/lib/cn';

import ProductGridList from '@features/product-list/grid/GridProductList';

import { useProductListViewModel } from '../hooks/useProductListViewModel';

import ProductNotFound from './ProductNotFound';

export default function SearchResult({ show }: { show: boolean }) {
  const { products, hasNextPage, nextDataRef } = useProductListViewModel();

  const isProductEmpty = !products || products.length === 0;

  return (
    <div className={cn({ hidden: !show })}>
      {isProductEmpty ? (
        <div className="flex justify-center pt-5 pb-10">
          <Suspense fallback={<></>}>
            <ProductNotFound />
          </Suspense>
        </div>
      ) : (
        <div className="pc:px-0 px-5">
          <ProductGridList products={products} />
        </div>
      )}

      {hasNextPage && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
