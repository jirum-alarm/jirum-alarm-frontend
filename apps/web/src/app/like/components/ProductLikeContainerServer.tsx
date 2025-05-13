import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { WishlistQueries } from '@/entities/wishlist';
import { OrderOptionType, WishlistOrderType } from '@/shared/api/gql/graphql';

import ProductLikeContainer from './ProductLikeContainer';

const ProductLikeContainerServer = async () => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchInfiniteQuery(
      WishlistQueries.infiniteWishlistsServer(
        {
          orderBy: WishlistOrderType.Id,
          orderOption: OrderOptionType.Desc,
          limit: 18,
        },
        cookieHeader,
      ),
    ),
    queryClient.prefetchQuery(WishlistQueries.wishlistCountServer(cookieHeader)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductLikeContainer />
    </HydrationBoundary>
  );
};

export default ProductLikeContainerServer;
