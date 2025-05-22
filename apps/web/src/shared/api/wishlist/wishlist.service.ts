import { execute } from '@/shared/lib/http';

import { graphql } from '../gql';
import {
  AddWishlistMutationVariables,
  QueryWishlistCountQuery,
  QueryWishlistCountQueryVariables,
  QueryWishlistsQuery,
  QueryWishlistsQueryVariables,
  RemoveWishlistMutationVariables,
} from '../gql/graphql';

export class WishlistService {
  static async addWishlist(variables: AddWishlistMutationVariables) {
    return execute(MutationAddWishlist, variables);
  }
  static async removeWishlist(variables: RemoveWishlistMutationVariables) {
    return execute(MutationRemoveWidthlist, variables);
  }
  static async getWishlistsServer(variables: QueryWishlistsQueryVariables) {
    return execute(QueryWishlists, variables);
  }
  static async getWishlists(variables: QueryWishlistsQueryVariables) {
    return execute(QueryWishlists, variables);
  }
  static async getWishlistCount() {
    return execute(QueryWishlistCount);
  }
  static async getWishlistCountServer() {
    return execute(QueryWishlistCount);
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
        hotDealType
        thumbnail
        isMyWishlist
        categoryId
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
const QueryWishlistCount = graphql(`
  query QueryWishlistCount {
    wishlistCount
  }
`);
