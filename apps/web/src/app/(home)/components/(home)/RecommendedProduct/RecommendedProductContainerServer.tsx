import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { ProductQueries } from '@/entities/product';
import RecommendedProductList from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductList';

const RecommendedProductListServer = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(ProductQueries.productKeywords());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RecommendedProductList />
    </HydrationBoundary>
  );
};

export default RecommendedProductListServer;
