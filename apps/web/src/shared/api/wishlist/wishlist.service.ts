import { graphql } from '../gql';

import { httpClient } from '@/shared/lib/http-client';
import {
  AddWishlistMutationVariables,
  QueryWishlistsQueryVariables,
  RemoveWishlistMutationVariables,
} from '../gql/graphql';

export class WishlistService {
  static async addWishlist(variables: AddWishlistMutationVariables) {
    return httpClient.execute(MutationAddWishlist, variables).then((res) => res.data);
  }
  static async removeWishlist(variables: RemoveWishlistMutationVariables) {
    return httpClient.execute(MutationRemoveWidthlist, variables).then((res) => res.data);
  }
  static async getWishlistsServer(variables: QueryWishlistsQueryVariables) {
    return httpClient.server_execute(QueryWishlists, variables).then((res) => res.data);
  }
  static async getWishlists(variables: QueryWishlistsQueryVariables) {
    return httpClient.execute(QueryWishlists, variables).then((res) => res.data);
  }
  static async getWishlistCount() {
    return httpClient.execute(QueryWishlistCount).then((res) => res.data);
  }
  static async getWishlistCountServer() {
    return httpClient.server_execute(QueryWishlistCount).then((res) => res.data);
  }
}

const MutationAddWishlist = graphql(`
  mutation AddWishlist($productId: Int!) {
    addWishlist(productId: $productId)
  }
`);

const MutationRemoveWidthlist = graphql(`
  mutation RemoveWishlist($productId: Int!) {
    removeWishlist(productId: $productId)
  }
`);

const QueryWishlists = graphql(`
  query QueryWishlists(
    $orderBy: WishlistOrderType!
    $orderOption: OrderOptionType!
    $limit: Int!
    $searchAfter: [String!]
  ) {
    wishlists(
      orderBy: $orderBy
      orderOption: $orderOption
      limit: $limit
      searchAfter: $searchAfter
    ) {
      id
      productId
      searchAfter
      product {
        id
        title
        price
        isHot
        isEnd
        isPrivate
        postedAt
        thumbnail
        isMyWishlist
      }
    }
  }
`);

// const QueryWishlistCount = graphql(`
//   query QueryWishlistCount {
//     wishlistCount
//   }
// `);
// const QueryWishlistCount = graphql(`
//   query QueryWishlistCount {
//     wishlistCount
//   }
// `);
const QueryWishlistCount = graphql('\n  query QueryWishlistCount {\n    wishlistCount\n  }\n');
