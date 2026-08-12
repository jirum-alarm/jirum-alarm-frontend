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
  '\n  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {\n    addPushToken(token: $token, tokenType: $tokenType)\n  }\n': typeof types.MutationAddPushTokenDocument;
  '\n  query ProductInfo($id: Int!) {\n    product(id: $id) {\n      id\n      categoryId\n      categoryName\n      title\n      url\n      detailUrl\n      isProfitUrl\n      profitLinkProvider\n      isHot\n      isEnd\n      price\n      postedAt\n      thumbnail\n      uploaderType\n      content\n      author {\n        id\n        nickname\n      }\n      provider {\n        id\n        name\n        nameKr\n        host\n      }\n      hotDealType\n      viewCount\n      mallName\n      data\n    }\n  }\n': typeof types.ProductInfoDocument;
  '\n  query ProductStats($id: Int!) {\n    product(id: $id) {\n      id\n      isHot\n      isEnd\n      wishlistCount\n      isMyLike\n      isMyReported\n      likeCount\n      isMyWishlist\n    }\n  }\n': typeof types.ProductStatsDocument;
  '\n  query ProductGuides($productId: Int!) {\n    productGuides(productId: $productId) {\n      id\n      title\n      content\n    }\n  }\n': typeof types.ProductGuidesDocument;
  '\n  mutation AddUserLikeOrDislike(\n    $target: UserLikeTarget!\n    $targetId: Int!\n    $isLike: Boolean\n  ) {\n    addUserLikeOrDislike(target: $target, targetId: $targetId, isLike: $isLike)\n  }\n': typeof types.AddUserLikeOrDislikeDocument;
  '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n': typeof types.QueryMeDocument;
};
const documents: Documents = {
  '\n    mutation MutationLogin($email: String!, $password: String!) {\n      login(email: $email, password: $password) {\n        accessToken\n        refreshToken\n      }\n    }\n  ':
    types.MutationLoginDocument,
  '\n  mutation MutationLoginByRefreshToken {\n    loginByRefreshToken {\n      accessToken\n      refreshToken\n    }\n  }\n':
    types.MutationLoginByRefreshTokenDocument,
  '\n  mutation MutationSocialLogin(\n    $oauthProvider: OauthProvider!\n    $socialAccessToken: String!\n    $email: String\n    $nickname: String\n    $birthYear: Float\n    $gender: Gender\n    $favoriteCategories: [Int!]\n  ) {\n    socialLogin(\n      oauthProvider: $oauthProvider\n      socialAccessToken: $socialAccessToken\n      email: $email\n      nickname: $nickname\n      birthYear: $birthYear\n      gender: $gender\n      favoriteCategories: $favoriteCategories\n    ) {\n      accessToken\n      refreshToken\n      type\n    }\n  }\n':
    types.MutationSocialLoginDocument,
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
  source: '\n  query QueryMe {\n    me {\n      id\n    }\n  }\n',
): typeof import('./graphql').QueryMeDocument;

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
