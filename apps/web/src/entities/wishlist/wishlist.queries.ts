import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { QueryWishlistsQueryVariables } from '@/shared/api/gql/graphql';
import { WishlistService } from '@/shared/api/wishlist/wishlist.service';

export const WishlistQueries = {
  all: () => ['wishlist'],
  lists: () => [...WishlistQueries.all(), 'list'],
  wishlistsServer: (variables: QueryWishlistsQueryVariables, cookieHeader: string) =>
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
      queryFn: () => WishlistService.getWishlistsServer(variables, cookieHeader),
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
  infiniteWishlistsServer: (variables: QueryWishlistsQueryVariables, cookieHeader: string) =>
    infiniteQueryOptions({
      queryKey: [...WishlistQueries.wishlistsServer(variables, cookieHeader).queryKey],
      queryFn: ({ pageParam }) =>
        WishlistService.getWishlistsServer(
          {
            ...variables,
            searchAfter: pageParam,
          },
          cookieHeader,
        ),
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
  wishlistCountServer: (cookieHeader: string) =>
    queryOptions({
      queryKey: [...WishlistQueries.all(), 'wishlistcount'],
      queryFn: () => WishlistService.getWishlistCountServer(cookieHeader),
    }),
  wishlistCount: () =>
    queryOptions({
      staleTime: 0,
      queryKey: [...WishlistQueries.all(), 'wishlistcount'],
      queryFn: () => WishlistService.getWishlistCount(),
    }),
};
