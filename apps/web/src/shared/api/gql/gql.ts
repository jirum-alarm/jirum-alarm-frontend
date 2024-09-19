/* eslint-disable */
import * as types from './graphql';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  '\n  mutation MutationLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.MutationLoginDocument,
  '\n  mutation MutationSignup(\n    $email: String!\n    $password: String!\n    $nickname: String!\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    signup(\n      email: $email\n      password: $password\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        nickname\n        birthYear\n        gender\n        favoriteCategories\n        linkedSocialProviders\n      }\n    }\n  }\n':
    types.MutationSignupDocument,
  '\n  mutation MutationUpdateUserProfile(\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    updateUserProfile(\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    )\n  }\n':
    types.MutationUpdateUserProfileDocument,
  '\n  query QueryMe {\n    me {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n    }\n  }\n':
    types.QueryMeDocument,
  '\n  query QueryMyCategories {\n    me {\n      favoriteCategories\n    }\n  }\n':
    types.QueryMyCategoriesDocument,
  '\n  mutation QueryLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.QueryLoginByRefreshTokenDocument,
  '\n  mutation MutationUpdatePassword($password: String!) {\n    updatePassword(password: $password)\n  }\n':
    types.MutationUpdatePasswordDocument,
  '\n  mutation MutationWithdraw {\n    withdraw\n  }\n': types.MutationWithdrawDocument,
  '\n  query QueryCategories {\n    categories {\n      id\n      name\n    }\n  }\n':
    types.QueryCategoriesDocument,
  '\n  mutation MutationAddNotificationKeyword($keyword: String!) {\n    addNotificationKeyword(keyword: $keyword)\n  }\n':
    types.MutationAddNotificationKeywordDocument,
  '\n  mutation MutationRemoveNotificationKeyword($id: Float!) {\n    removeNotificationKeyword(id: $id)\n  }\n':
    types.MutationRemoveNotificationKeywordDocument,
  '\n  query QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {\n    notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {\n      id\n      keyword\n    }\n  }\n':
    types.QueryMypageKeywordDocument,
  '\n  query QueryNotifications($offset: Int!, $limit: Int!) {\n    notifications(offset: $offset, limit: $limit) {\n      id\n      readAt\n      createdAt\n      message\n      url\n      keyword\n      product {\n        id\n        thumbnail\n        price\n        isHot\n        isEnd\n      }\n    }\n  }\n':
    types.QueryNotificationsDocument,
  '\n  query QueryUnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n':
    types.QueryUnreadNotificationsCountDocument,
  '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n':
    types.MutationAddPushTokenDocument,
  '\n  query product($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      guides {\n        id\n        title\n        content\n      }\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      isMyWishlist\n      categoryName\n    }\n  }\n':
    types.ProductDocument,
  '\n  query productGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n':
    types.ProductGuidesDocument,
  '\n  query QueryProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryId: Int\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryId: $categoryId\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.QueryProductsDocument,
  '\n  query QueryRankingProducts {\n    rankingProducts {\n      id\n      title\n      url\n      price\n      thumbnail\n    }\n  }\n':
    types.QueryRankingProductsDocument,
  '\n  query QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n    communityRandomRankingProducts(count: $count, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.QueryCommunityRandomRankingProductsDocument,
  '\n  query togetherViewedProducts($limit: Int!, $productId: Int!) {\n    togetherViewedProducts(limit: $limit, productId: $productId) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n':
    types.TogetherViewedProductsDocument,
  '\n  mutation MutationCollectProduct($productId: Int!) {\n    collectProduct(productId: $productId)\n  }\n':
    types.MutationCollectProductDocument,
  '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n':
    types.AddWishlistDocument,
  '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n':
    types.RemoveWishlistDocument,
  '\n  query QueryWishlists(\n    $orderBy: WishlistOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    wishlists(\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      productId\n      searchAfter\n      product {\n        id\n        title\n        price\n        isHot\n        isEnd\n        isPrivate\n        postedAt\n        thumbnail\n        isMyWishlist\n      }\n    }\n  }\n':
    types.QueryWishlistsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationLogin($email: String!, $password: String!) {\n    login(email: $email, password: $password) {\n      accessToken\n      refreshToken\n    }\n  }\n',
): typeof import('./graphql').MutationLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationSignup(\n    $email: String!\n    $password: String!\n    $nickname: String!\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    signup(\n      email: $email\n      password: $password\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      user {\n        id\n        email\n        nickname\n        birthYear\n        gender\n        favoriteCategories\n        linkedSocialProviders\n      }\n    }\n  }\n',
): typeof import('./graphql').MutationSignupDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationUpdateUserProfile(\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    updateUserProfile(\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    )\n  }\n',
): typeof import('./graphql').MutationUpdateUserProfileDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryMe {\n    me {\n      id\n      email\n      nickname\n      birthYear\n      gender\n      favoriteCategories\n    }\n  }\n',
): typeof import('./graphql').QueryMeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryMyCategories {\n    me {\n      favoriteCategories\n    }\n  }\n',
): typeof import('./graphql').QueryMyCategoriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation QueryLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n',
): typeof import('./graphql').QueryLoginByRefreshTokenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationUpdatePassword($password: String!) {\n    updatePassword(password: $password)\n  }\n',
): typeof import('./graphql').MutationUpdatePasswordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationWithdraw {\n    withdraw\n  }\n',
): typeof import('./graphql').MutationWithdrawDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryCategories {\n    categories {\n      id\n      name\n    }\n  }\n',
): typeof import('./graphql').QueryCategoriesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAddNotificationKeyword($keyword: String!) {\n    addNotificationKeyword(keyword: $keyword)\n  }\n',
): typeof import('./graphql').MutationAddNotificationKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationRemoveNotificationKeyword($id: Float!) {\n    removeNotificationKeyword(id: $id)\n  }\n',
): typeof import('./graphql').MutationRemoveNotificationKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {\n    notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {\n      id\n      keyword\n    }\n  }\n',
): typeof import('./graphql').QueryMypageKeywordDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryNotifications($offset: Int!, $limit: Int!) {\n    notifications(offset: $offset, limit: $limit) {\n      id\n      readAt\n      createdAt\n      message\n      url\n      keyword\n      product {\n        id\n        thumbnail\n        price\n        isHot\n        isEnd\n      }\n    }\n  }\n',
): typeof import('./graphql').QueryNotificationsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryUnreadNotificationsCount {\n    unreadNotificationsCount\n  }\n',
): typeof import('./graphql').QueryUnreadNotificationsCountDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n',
): typeof import('./graphql').MutationAddPushTokenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query product($id: Int!) {\n    product(id: $id) {\n      id\n      providerId\n      category\n      categoryId\n      mallId\n      title\n      url\n      detailUrl\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      wishlistCount\n      positiveCommunityReactionCount\n      negativeCommunityReactionCount\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      viewCount\n      mallName\n      guides {\n        id\n        title\n        content\n      }\n      prices {\n        id\n        target\n        type\n        price\n        createdAt\n      }\n      isMyWishlist\n      categoryName\n    }\n  }\n',
): typeof import('./graphql').ProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query productGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n',
): typeof import('./graphql').ProductGuidesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryProducts(\n    $limit: Int!\n    $searchAfter: [String!]\n    $startDate: DateTime\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n    $categoryId: Int\n    $keyword: String\n    $thumbnailType: ThumbnailType\n    $isEnd: Boolean\n    $isHot: Boolean\n  ) {\n    products(\n      limit: $limit\n      searchAfter: $searchAfter\n      startDate: $startDate\n      orderBy: $orderBy\n      orderOption: $orderOption\n      categoryId: $categoryId\n      keyword: $keyword\n      thumbnailType: $thumbnailType\n      isEnd: $isEnd\n      isHot: $isHot\n    ) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QueryProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryRankingProducts {\n    rankingProducts {\n      id\n      title\n      url\n      price\n      thumbnail\n    }\n  }\n',
): typeof import('./graphql').QueryRankingProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryCommunityRandomRankingProducts($count: Int!, $limit: Int!) {\n    communityRandomRankingProducts(count: $count, limit: $limit) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').QueryCommunityRandomRankingProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query togetherViewedProducts($limit: Int!, $productId: Int!) {\n    togetherViewedProducts(limit: $limit, productId: $productId) {\n      id\n      title\n      mallId\n      url\n      isHot\n      isEnd\n      price\n      providerId\n      categoryId\n      category\n      thumbnail\n      provider {\n        nameKr\n      }\n      searchAfter\n      postedAt\n    }\n  }\n',
): typeof import('./graphql').TogetherViewedProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationCollectProduct($productId: Int!) {\n    collectProduct(productId: $productId)\n  }\n',
): typeof import('./graphql').MutationCollectProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n',
): typeof import('./graphql').AddWishlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n',
): typeof import('./graphql').RemoveWishlistDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryWishlists(\n    $orderBy: WishlistOrderType!\n    $orderOption: OrderOptionType!\n    $limit: Int!\n    $searchAfter: [String!]\n  ) {\n    wishlists(\n      orderBy: $orderBy\n      orderOption: $orderOption\n      limit: $limit\n      searchAfter: $searchAfter\n    ) {\n      id\n      productId\n      searchAfter\n      product {\n        id\n        title\n        price\n        isHot\n        isEnd\n        isPrivate\n        postedAt\n        thumbnail\n        isMyWishlist\n      }\n    }\n  }\n',
): typeof import('./graphql').QueryWishlistsDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
