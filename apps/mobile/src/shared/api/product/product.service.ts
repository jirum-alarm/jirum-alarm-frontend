import {
  MutationAddUserLikeOrDislike,
  MutationAddNotificationKeyword,
  MutationAddWishlist,
  MutationCollectProduct,
  MutationRemoveWishlist,
  QueryCategorizedReactionKeywords,
  QueryProductAdditionalInfo,
  QueryCategoryProducts,
  QueryKeywordProducts,
  QueryMyNotificationKeywords,
  QueryProductPriceHistory,
  QueryTogetherViewedProducts,
  QueryProductGuides,
  QueryProductInfo,
  QueryProductStats,
} from '@/graphql/product';
import {HttpClient} from '@/shared/lib/client';
import type {
  AddUserLikeOrDislikeMutationVariables,
  AddNotificationKeywordMutationVariables,
  AddWishlistMutationVariables,
  MyNotificationKeywordsQueryVariables,
  CollectProductMutationVariables,
  RemoveWishlistMutationVariables,
  CategorizedReactionKeywordsQueryVariables,
  ProductAdditionalInfoQueryVariables,
  CategoryProductsQueryVariables,
  KeywordProductsQueryVariables,
  ProductPriceHistoryQueryVariables,
  TogetherViewedProductsQueryVariables,
  ProductGuidesQueryVariables,
  ProductInfoQueryVariables,
  ProductStatsQueryVariables,
} from '@/shared/api/gql/graphql.ts';

export class ProductService {
  /**
   * 상세 상단 블록의 단일 소스. 비로그인도 조회 가능하지만 access token 을 실어
   * 보낸다 — 서버가 토큰 유무로 응답을 바꾸지 않더라도, 로그인 유저의 조회를
   * 기록하는 쪽이 랭킹 신호에 정확하다.
   */
  static async getProductInfo(variables: ProductInfoQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryProductInfo,
      variables,
    );
    return res.data?.product ?? null;
  }

  /** 좋아요/신고 상태. 로그인 여부로 값이 바뀌므로 ProductInfo 와 캐시를 분리한다. */
  static async getProductStats(variables: ProductStatsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryProductStats,
      variables,
    );
    return res.data?.product ?? null;
  }

  static async getProductGuides(variables: ProductGuidesQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryProductGuides,
      variables,
    );
    return res.data?.productGuides ?? [];
  }

  /**
   * 상세 조회 수집. fire-and-forget — 실패해도 화면 흐름을 막지 않는다.
   * X-Device-Id 헤더는 HttpClient 가 붙인다.
   */
  static async collectProduct(variables: CollectProductMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationCollectProduct,
      variables,
    );
    return res.data?.collectProduct ?? null;
  }

  static async getTogetherViewedProducts(
    variables: TogetherViewedProductsQueryVariables,
  ) {
    const res = await HttpClient.withAccessToken().execute(
      QueryTogetherViewedProducts,
      variables,
    );
    return res.data?.togetherViewedProducts ?? [];
  }

  static async getPriceHistory(variables: ProductPriceHistoryQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryProductPriceHistory,
      variables,
    );
    return res.data?.product?.priceHistory ?? null;
  }

  static async getProductAdditionalInfo(
    variables: ProductAdditionalInfoQueryVariables,
  ) {
    const res = await HttpClient.withAccessToken().execute(
      QueryProductAdditionalInfo,
      variables,
    );
    return res.data?.product ?? null;
  }

  static async getReactionKeywords(
    variables: CategorizedReactionKeywordsQueryVariables,
  ) {
    const res = await HttpClient.withAccessToken().execute(
      QueryCategorizedReactionKeywords,
      variables,
    );
    return res.data?.categorizedReactionKeywords ?? null;
  }

  static async getCategoryProducts(variables: CategoryProductsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryCategoryProducts,
      variables,
    );
    return res.data?.products ?? [];
  }

  static async getKeywordProducts(variables: KeywordProductsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QueryKeywordProducts,
      variables,
    );
    return res.data?.products ?? [];
  }

  static async addNotificationKeyword(
    variables: AddNotificationKeywordMutationVariables,
  ) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddNotificationKeyword,
      variables,
    );
    return res.data?.addNotificationKeyword ?? null;
  }

  static async getMyNotificationKeywords(
    variables: MyNotificationKeywordsQueryVariables,
  ) {
    const res = await HttpClient.withAccessToken().execute(
      QueryMyNotificationKeywords,
      variables,
    );
    return res.data?.notificationKeywordsByMe ?? [];
  }

  static async addWishlist(variables: AddWishlistMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddWishlist,
      variables,
    );
    return res.data?.addWishlist ?? null;
  }

  static async removeWishlist(variables: RemoveWishlistMutationVariables) {
    const res = await HttpClient.withAccessToken().execute(
      MutationRemoveWishlist,
      variables,
    );
    return res.data?.removeWishlist ?? null;
  }

  static async addUserLikeOrDislike(
    variables: AddUserLikeOrDislikeMutationVariables,
  ) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddUserLikeOrDislike,
      variables,
    );
    return res.data?.addUserLikeOrDislike ?? null;
  }
}
