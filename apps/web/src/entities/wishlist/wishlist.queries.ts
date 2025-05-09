import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { QueryWishlistsQueryVariables } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';

export const WishlistQueries = {
  all: () => ['wishlist'],
  lists: () => [...WishlistQueries.all(), 'list'],
  wishlistsServer: (variables: QueryWishlistsQueryVariables) =>
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
      queryFn: () => WishlistService.getWishlistsServer(variables),
    }),
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
  infiniteWishlistsServer: (variables: QueryWishlistsQueryVariables) =>
    infiniteQueryOptions({
      queryKey: [...WishlistQueries.wishlistsServer(variables).queryKey],
      queryFn: ({ pageParam }) =>
        WishlistService.getWishlistsServer({
          ...variables,
          searchAfter: pageParam,
        }),
      initialPageParam: null as null | string,
      getNextPageParam: (lastPage) => {
        return lastPage.wishlists.at(-1)?.searchAfter?.[0];
      },
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
      queryFn: () => WishlistService.getWishlistCountServer(),
    }),
  wishlistCount: () =>
    queryOptions({
      staleTime: 0,
      queryKey: [...WishlistQueries.all(), 'wishlistcount'],
      queryFn: () => WishlistService.getWishlistCount(),
    }),
};
