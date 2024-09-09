import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import React from 'react';

import ProductDetailPageHeader from './ProductDeatilPageHeader';
import ProductDetailContainer from './ProductDetailContainer';

import BasicLayout from '@/components/layout/BasicLayout';
import { ProductQueries } from '@/entities/product';

const ProductDetailContainerServer = async ({ productId }: { productId: number }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.product({ id: productId }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BasicLayout header={<ProductDetailPageHeader productId={productId} />}>
        <ProductDetailContainer productId={productId} />
      </BasicLayout>
    </HydrationBoundary>
  );
};

export default ProductDetailContainerServer;
