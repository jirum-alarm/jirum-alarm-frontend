import { QueryWishlistsQueryVariables } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

export const WishlistQueries = {
  all: () => ['wishlist'],
  wishlistsServer: (variables: QueryWishlistsQueryVariables) =>
    queryOptions({
      queryKey: [
        ...WishlistQueries.all(),
        'wishlist',
        {
          orderBy: variables.orderBy,
          orderOption: variables.orderOption,
          limit: variables.limit,
          searchAfter: variables.searchAfter,
        },
      ],
      queryFn: () => WishlistService.getWishlistsServer(variables),
    }),
  infiniteWishlists: (variables: QueryWishlistsQueryVariables) =>
    infiniteQueryOptions({
      queryKey: [...WishlistQueries.wishlistsServer(variables).queryKey],
      queryFn: ({ pageParam }) =>
        WishlistService.getWishlistsServer({ ...variables, searchAfter: pageParam }),
      initialPageParam: null as null | string,
      getNextPageParam: (lastPage) => {
        return lastPage.wishlists.at(-1)?.searchAfter?.[0];
      },
    }),
};
