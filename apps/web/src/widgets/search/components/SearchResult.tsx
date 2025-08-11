import { Suspense } from 'react';

import TopButton from '@/components/TopButton';
import { cn } from '@/lib/cn';

import ProductGridList from '@features/products/grid/GridProductList';

import { useProductListViewModel } from '../hooks/useProductListViewModel';

import ProductNotFound from './ProductNotFound';

export default function SearchResult({ show }: { show: boolean }) {
  const { products, hasNextPage, nextDataRef } = useProductListViewModel();

  const isProductEmpty = !products || products.length === 0;

  return (
    <div className={cn({ hidden: !show })}>
      {isProductEmpty ? (
        <div className="flex justify-center pb-10 pt-5">
          <Suspense fallback={<></>}>
            <ProductNotFound />
          </Suspense>
        </div>
      ) : (
        <ProductGridList products={products} />
      )}

      {!isProductEmpty && (
        <div className="fixed bottom-0 left-0 right-0">
          <TopButton />
        </div>
      )}
      {hasNextPage && <div ref={nextDataRef} className="h-[48px] w-full" />}
    </div>
  );
}
