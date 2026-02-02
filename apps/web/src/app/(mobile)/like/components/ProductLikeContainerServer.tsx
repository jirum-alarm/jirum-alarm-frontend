import { WishlistQueries } from '@/entities/wishlist';
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { OrderOptionType, WishlistOrderType } from '@/shared/api/gql/graphql';


import ProductLikeContainer from './ProductLikeContainer';

const ProductLikeContainerServer = async () => {
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      WishlistQueries.infiniteWishlists({
        orderBy: WishlistOrderType.Id,
        orderOption: OrderOptionType.Desc,
        limit: 18,
      }),
    ),
    queryClient.prefetchQuery(WishlistQueries.wishlistCount()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductLikeContainer />
    </HydrationBoundary>
  );
};

export default ProductLikeContainerServer;
