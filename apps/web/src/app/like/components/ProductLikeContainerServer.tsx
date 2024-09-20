import { OrderOptionType, WishlistOrderType } from '@/shared/api/gql/graphql';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import ProductLikeContainer from './ProductLikeContainer';
import { WishlistQueries } from '@/entities/wishlist';

const ProductLikeContainerServer = async () => {
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery(
    WishlistQueries.infiniteWishlists({
      orderBy: WishlistOrderType.Id,
      orderOption: OrderOptionType.Desc,
      limit: 10,
    }),
  );
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductLikeContainer />
    </HydrationBoundary>
  );
};

export default ProductLikeContainerServer;
