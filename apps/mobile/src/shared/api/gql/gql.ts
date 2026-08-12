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
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
  '\n    mutation MutationLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        accessToken\n        refreshToken\n      }\n    }\n  ': typeof types.MutationLoginDocument;
  '\n  mutation MutationLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n': typeof types.MutationLoginByRefreshTokenDocument;
  '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n': typeof types.MutationSocialLoginDocument;
  '\n  query Comments(\n    $productId: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      productId: $productId\n      limit: $limit\n      searchAfter: $searchAfter\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      likeCount\n      isMyLike\n      replyCount\n      author {\n        id\n        nickname\n      }\n    }\n  }\n': typeof types.CommentsDocument;
  '\n  mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n': typeof types.AddCommentDocument;
  '\n  mutation UpdateComment($id: Int!, $content: String) {\n    updateComment(id: $id, content: $content)\n  }\n': typeof types.UpdateCommentDocument;
  '\n  mutation RemoveComment($id: Int!) {\n    removeComment(id: $id)\n  }\n': typeof types.RemoveCommentDocument;
  '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n': typeof types.MutationAddPushTokenDocument;
  '\n  query ProductInfo($id: Int!) {\n    product(id: $id) {\n      id\n      categoryId\n      categoryName\n      title\n      url\n      detailUrl\n      isProfitUrl\n      profitLinkProvider\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      uploaderType\n      content\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      hotDealType\n      viewCount\n      mallName\n      data\n    }\n  }\n': typeof types.ProductInfoDocument;
  '\n  query ProductStats($id: Int!) {\n    product(id: $id) {\n      id\n      isHot\n      isEnd\n      wishlistCount\n      isMyLike\n      isMyReported\n      likeCount\n      isMyWishlist\n    }\n  }\n': typeof types.ProductStatsDocument;
  '\n  query ProductGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n': typeof types.ProductGuidesDocument;
  '\n  mutation AddUserLikeOrDislike(\n    $target: UserLikeTarget!\n    $targetId: Int!\n    $isLike: Boolean\n  ) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n': typeof types.AddUserLikeOrDislikeDocument;
  '\n  query ProductPriceHistory($id: Int!, $days: Int) {\n    product(id: $id) {\n      id\n      priceHistory(days: $days) {\n        basis\n        confidence\n        currency\n        disclaimer\n        pointCount\n        rangeDays\n        sampleCount\n        priceAxis\n        unitLabel\n        points {\n          date\n          price\n          deal {\n            id\n            title\n            displayTitle\n            parsedPrice\n            price\n            priceCurrency\n            postedAt\n            providerId\n            providerName\n            thumbnail\n            url\n            isSeed\n            categoryId\n          }\n        }\n      }\n    }\n  }\n': typeof types.ProductPriceHistoryDocument;
  '\n  query ProductAdditionalInfo($id: Int!) {\n    product(id: $id) {\n      id\n      url\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n': typeof types.ProductAdditionalInfoDocument;
  '\n  query CategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      items {\n        name\n        count\n        type\n        role\n        tag\n      }\n      lastUpdatedAt\n    }\n  }\n': typeof types.CategorizedReactionKeywordsDocument;
  '\n  query TogetherViewedProducts($productId: Int!, $limit: Int!) {\n    togetherViewedProducts(productId: $productId, limit: $limit) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n': typeof types.TogetherViewedProductsDocument;
  '\n  mutation CollectProduct($productId: Int!, $source: String, $position: Int) {\n    collectProduct(productId: $productId, source: $source, position: $position)\n  }\n': typeof types.CollectProductDocument;
  '\n  query CategoryProducts(\n    $categoryIds: [Int!]\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      categoryIds: $categoryIds\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n': typeof types.CategoryProductsDocument;
  '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n': typeof types.AddWishlistDocument;
  '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n': typeof types.RemoveWishlistDocument;
  '\n  mutation ReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n': typeof types.ReportExpiredProductDocument;
  '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n': typeof types.QueryMeDocument;
};
const documents: Documents = {
  '\n    mutation MutationLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        accessToken\n        refreshToken\n      }\n    }\n  ':
    types.MutationLoginDocument,
  '\n  mutation MutationLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.MutationLoginByRefreshTokenDocument,
  '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n':
    types.MutationSocialLoginDocument,
  '\n  query Comments(\n    $productId: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      productId: $productId\n      limit: $limit\n      searchAfter: $searchAfter\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      likeCount\n      isMyLike\n      replyCount\n      author {\n        id\n        nickname\n      }\n    }\n  }\n':
    types.CommentsDocument,
  '\n  mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n':
    types.AddCommentDocument,
  '\n  mutation UpdateComment($id: Int!, $content: String) {\n    updateComment(id: $id, content: $content)\n  }\n':
    types.UpdateCommentDocument,
  '\n  mutation RemoveComment($id: Int!) {\n    removeComment(id: $id)\n  }\n':
    types.RemoveCommentDocument,
  '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n':
    types.MutationAddPushTokenDocument,
  '\n  query ProductInfo($id: Int!) {\n    product(id: $id) {\n      id\n      categoryId\n      categoryName\n      title\n      url\n      detailUrl\n      isProfitUrl\n      profitLinkProvider\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      uploaderType\n      content\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      hotDealType\n      viewCount\n      mallName\n      data\n    }\n  }\n':
    types.ProductInfoDocument,
  '\n  query ProductStats($id: Int!) {\n    product(id: $id) {\n      id\n      isHot\n      isEnd\n      wishlistCount\n      isMyLike\n      isMyReported\n      likeCount\n      isMyWishlist\n    }\n  }\n':
    types.ProductStatsDocument,
  '\n  query ProductGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n':
    types.ProductGuidesDocument,
  '\n  mutation AddUserLikeOrDislike(\n    $target: UserLikeTarget!\n    $targetId: Int!\n    $isLike: Boolean\n  ) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n':
    types.AddUserLikeOrDislikeDocument,
  '\n  query ProductPriceHistory($id: Int!, $days: Int) {\n    product(id: $id) {\n      id\n      priceHistory(days: $days) {\n        basis\n        confidence\n        currency\n        disclaimer\n        pointCount\n        rangeDays\n        sampleCount\n        priceAxis\n        unitLabel\n        points {\n          date\n          price\n          deal {\n            id\n            title\n            displayTitle\n            parsedPrice\n            price\n            priceCurrency\n            postedAt\n            providerId\n            providerName\n            thumbnail\n            url\n            isSeed\n            categoryId\n          }\n        }\n      }\n    }\n  }\n':
    types.ProductPriceHistoryDocument,
  '\n  query ProductAdditionalInfo($id: Int!) {\n    product(id: $id) {\n      id\n      url\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n':
    types.ProductAdditionalInfoDocument,
  '\n  query CategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      items {\n        name\n        count\n        type\n        role\n        tag\n      }\n      lastUpdatedAt\n    }\n  }\n':
    types.CategorizedReactionKeywordsDocument,
  '\n  query TogetherViewedProducts($productId: Int!, $limit: Int!) {\n    togetherViewedProducts(productId: $productId, limit: $limit) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n':
    types.TogetherViewedProductsDocument,
  '\n  mutation CollectProduct($productId: Int!, $source: String, $position: Int) {\n    collectProduct(productId: $productId, source: $source, position: $position)\n  }\n':
    types.CollectProductDocument,
  '\n  query CategoryProducts(\n    $categoryIds: [Int!]\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      categoryIds: $categoryIds\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n':
    types.CategoryProductsDocument,
  '\n  mutation AddWishlist($productId: Int!) {\n    addWishlist(productId: $productId)\n  }\n':
    types.AddWishlistDocument,
  '\n  mutation RemoveWishlist($productId: Int!) {\n    removeWishlist(productId: $productId)\n  }\n':
    types.RemoveWishlistDocument,
  '\n  mutation ReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n':
    types.ReportExpiredProductDocument,
  '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n':
    types.QueryMeDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n    mutation MutationLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        accessToken\n        refreshToken\n      }\n    }\n  ',
): typeof import('./graphql').MutationLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n',
): typeof import('./graphql').MutationLoginByRefreshTokenDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n',
): typeof import('./graphql').MutationSocialLoginDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query Comments(\n    $productId: Int!\n    $limit: Int!\n    $searchAfter: [String!]\n    $orderBy: CommentOrder!\n    $orderOption: OrderOptionType!\n  ) {\n    comments(\n      productId: $productId\n      limit: $limit\n      searchAfter: $searchAfter\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      productId\n      parentId\n      content\n      createdAt\n      searchAfter\n      likeCount\n      isMyLike\n      replyCount\n      author {\n        id\n        nickname\n      }\n    }\n  }\n',
): typeof import('./graphql').CommentsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddComment($productId: Int!, $content: String!, $parentId: Int) {\n    addComment(productId: $productId, content: $content, parentId: $parentId)\n  }\n',
): typeof import('./graphql').AddCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation UpdateComment($id: Int!, $content: String) {\n    updateComment(id: $id, content: $content)\n  }\n',
): typeof import('./graphql').UpdateCommentDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation RemoveComment($id: Int!) {\n    removeComment(id: $id)\n  }\n',
): typeof import('./graphql').RemoveCommentDocument;
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
  source: '\n  query ProductInfo($id: Int!) {\n    product(id: $id) {\n      id\n      categoryId\n      categoryName\n      title\n      url\n      detailUrl\n      isProfitUrl\n      profitLinkProvider\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      uploaderType\n      content\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      hotDealType\n      viewCount\n      mallName\n      data\n    }\n  }\n',
): typeof import('./graphql').ProductInfoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductStats($id: Int!) {\n    product(id: $id) {\n      id\n      isHot\n      isEnd\n      wishlistCount\n      isMyLike\n      isMyReported\n      likeCount\n      isMyWishlist\n    }\n  }\n',
): typeof import('./graphql').ProductStatsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n',
): typeof import('./graphql').ProductGuidesDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation AddUserLikeOrDislike(\n    $target: UserLikeTarget!\n    $targetId: Int!\n    $isLike: Boolean\n  ) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n',
): typeof import('./graphql').AddUserLikeOrDislikeDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductPriceHistory($id: Int!, $days: Int) {\n    product(id: $id) {\n      id\n      priceHistory(days: $days) {\n        basis\n        confidence\n        currency\n        disclaimer\n        pointCount\n        rangeDays\n        sampleCount\n        priceAxis\n        unitLabel\n        points {\n          date\n          price\n          deal {\n            id\n            title\n            displayTitle\n            parsedPrice\n            price\n            priceCurrency\n            postedAt\n            providerId\n            providerName\n            thumbnail\n            url\n            isSeed\n            categoryId\n          }\n        }\n      }\n    }\n  }\n',
): typeof import('./graphql').ProductPriceHistoryDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query ProductAdditionalInfo($id: Int!) {\n    product(id: $id) {\n      id\n      url\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n',
): typeof import('./graphql').ProductAdditionalInfoDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CategorizedReactionKeywords($id: Int!) {\n    categorizedReactionKeywords(id: $id) {\n      items {\n        name\n        count\n        type\n        role\n        tag\n      }\n      lastUpdatedAt\n    }\n  }\n',
): typeof import('./graphql').CategorizedReactionKeywordsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query TogetherViewedProducts($productId: Int!, $limit: Int!) {\n    togetherViewedProducts(productId: $productId, limit: $limit) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n',
): typeof import('./graphql').TogetherViewedProductsDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  mutation CollectProduct($productId: Int!, $source: String, $position: Int) {\n    collectProduct(productId: $productId, source: $source, position: $position)\n  }\n',
): typeof import('./graphql').CollectProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query CategoryProducts(\n    $categoryIds: [Int!]\n    $limit: Int!\n    $orderBy: ProductOrderType\n    $orderOption: OrderOptionType\n  ) {\n    products(\n      categoryIds: $categoryIds\n      limit: $limit\n      orderBy: $orderBy\n      orderOption: $orderOption\n    ) {\n      id\n      title\n      price\n      thumbnail\n      isEnd\n      hotDealType\n      categoryId\n      mallName\n      postedAt\n      earliestExpiryDate\n      provider {\n        id\n        nameKr\n      }\n    }\n  }\n',
): typeof import('./graphql').CategoryProductsDocument;
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
  source: '\n  mutation ReportExpiredProduct($productId: Int!) {\n    reportExpiredProduct(productId: $productId)\n  }\n',
): typeof import('./graphql').ReportExpiredProductDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n',
): typeof import('./graphql').QueryMeDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
