import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { QueryWishlistsQueryVariables } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';

export const WishlistQueries = {
  all: () => ['wishlist'],
  lists: () => [...WishlistQueries.all(), 'list'],
  wishlists: (variables: QueryWishlistsQueryVariables) =>
    queryOptions({
      queryKey: [
        ...WishlistQueries.lists(),
        {
          orderBy: variables.orderBy,
          orderOption: variables.orderOption,
          limit: variables.limit,
          searchAfter: variables.searchAfter,
        },
      ],
      queryFn: () => WishlistService.getWishlists(variables),
    }),
  infiniteWishlists: (variables: QueryWishlistsQueryVariables) =>
    infiniteQueryOptions({
      staleTime: 0,
      queryKey: [...WishlistQueries.wishlists(variables).queryKey],
      queryFn: ({ pageParam }) =>
        WishlistService.getWishlists({ ...variables, searchAfter: pageParam }),
      initialPageParam: null as null | string,
      getNextPageParam: (lastPage) => {
        return lastPage.wishlists.at(-1)?.searchAfter?.[0];
      },
    }),
  wishlistCountServer: () =>
    queryOptions({
      queryKey: [...WishlistQueries.all(), 'wishlistcount'],
      queryFn: () => WishlistService.getWishlistCount(),
    }),
  wishlistCount: () =>
    queryOptions({
      staleTime: 0,
      queryKey: [...WishlistQueries.all(), 'wishlistcount'],
      queryFn: () => WishlistService.getWishlistCount(),
    }),
};
