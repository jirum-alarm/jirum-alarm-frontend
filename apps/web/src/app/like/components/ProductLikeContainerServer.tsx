import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { WishlistQueries } from '@/entities/wishlist';
import { OrderOptionType, WishlistOrderType } from '@/shared/api/gql/graphql';

import ProductLikeContainer from './ProductLikeContainer';

const ProductLikeContainerServer = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      WishlistQueries.infiniteWishlistsServer({
        orderBy: WishlistOrderType.Id,
        orderOption: OrderOptionType.Desc,
        limit: 18,
      }),
    ),
    queryClient.prefetchQuery(WishlistQueries.wishlistCountServer()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductLikeContainer />
    </HydrationBoundary>
  );
};

export default ProductLikeContainerServer;
