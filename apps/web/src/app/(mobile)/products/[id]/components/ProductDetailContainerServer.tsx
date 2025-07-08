import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';

import ProductDetailContainer from './ProductDetailContainer';

const ProductDetailContainerServer = async ({ productId }: { productId: number }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.productServer({ id: productId }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductDetailContainer productId={productId} />
    </HydrationBoundary>
  );
};

export default ProductDetailContainerServer;
