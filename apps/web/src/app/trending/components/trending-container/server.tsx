import { CategoryQueries } from '@/entities/category';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { TrendingContainer } from '.';

const TrendingContainerServer = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery(CategoryQueries.categoriesForUser());
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrendingContainer />
    </HydrationBoundary>
  );
};

export default TrendingContainerServer;