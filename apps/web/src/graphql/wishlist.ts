import { gql } from '@apollo/client';

export const MutationAddWishlist = gql`
  mutation AddWishlist($productId: Int!) {
    addWishlist(productId: $productId)
  }
`;

export const MutationRemoveWishlist = gql`
  mutation RemoveWishlist($productId: Int!) {
    removeWishlist(productId: $productId)
  }
`;

export const QueryWishlists = gql`
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
`;

export const QueryWishlistCount = gql`
  query QueryWishlistCount {
    wishlistCount
  }
`;
