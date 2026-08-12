import {queryOptions} from '@tanstack/react-query';

import {ProductService} from '@/shared/api/product/product.service.ts';
import type {
  ProductGuidesQueryVariables,
  ProductInfoQueryVariables,
  ProductStatsQueryVariables,
  CategorizedReactionKeywordsQueryVariables,
  ProductAdditionalInfoQueryVariables,
  CategoryProductsQueryVariables,
  KeywordProductsQueryVariables,
  ProductPriceHistoryQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '@/shared/api/gql/graphql.ts';

/**
 * ReactQueryProvider 가 retry: false 를 전역으로 걸어둔 탓에 네트워크가 한 번만
 * 튀어도 상세가 즉시 에러 화면이 된다. 모바일 네트워크에선 흔한 일이라
 * 상세 쿼리만 재시도를 되살린다.
 */
const RETRY = 2;

export class ProductQueries {
  static readonly keys = {
    all: ['product'] as const,
    detail: (id: number) => [...this.keys.all, 'detail', id] as const,
    info: (id: number) => [...this.keys.detail(id), 'info'] as const,
    stats: (id: number) => [...this.keys.detail(id), 'stats'] as const,
    guides: (id: number) => [...this.keys.detail(id), 'guides'] as const,
    priceHistory: (id: number, days?: number | null) =>
      [...this.keys.detail(id), 'priceHistory', days ?? 'all'] as const,
    additionalInfo: (id: number) =>
      [...this.keys.detail(id), 'additionalInfo'] as const,
    reactionKeywords: (id: number) =>
      [...this.keys.detail(id), 'reactionKeywords'] as const,
    keywordProducts: (keyword: string) =>
      [...this.keys.all, 'keyword', keyword] as const,
    categoryPopular: (categoryId: number) =>
      [...this.keys.all, 'categoryPopular', categoryId] as const,
    togetherViewed: (id: number) =>
      [...this.keys.detail(id), 'togetherViewed'] as const,
  };

  static info(variables: ProductInfoQueryVariables) {
    return queryOptions({
      queryKey: this.keys.info(variables.id),
      queryFn: () => ProductService.getProductInfo(variables),
      retry: RETRY,
    });
  }

  static stats(variables: ProductStatsQueryVariables) {
    return queryOptions({
      queryKey: this.keys.stats(variables.id),
      queryFn: () => ProductService.getProductStats(variables),
      retry: RETRY,
    });
  }

  static togetherViewed(variables: TogetherViewedProductsQueryVariables) {
    return queryOptions({
      queryKey: this.keys.togetherViewed(variables.productId),
      queryFn: () => ProductService.getTogetherViewedProducts(variables),
      retry: RETRY,
    });
  }

  static priceHistory(variables: ProductPriceHistoryQueryVariables) {
    return queryOptions({
      queryKey: this.keys.priceHistory(variables.id, variables.days),
      queryFn: () => ProductService.getPriceHistory(variables),
      retry: RETRY,
    });
  }

  static additionalInfo(variables: ProductAdditionalInfoQueryVariables) {
    return queryOptions({
      queryKey: this.keys.additionalInfo(variables.id),
      queryFn: () => ProductService.getProductAdditionalInfo(variables),
      retry: RETRY,
    });
  }

  static reactionKeywords(
    variables: CategorizedReactionKeywordsQueryVariables,
  ) {
    return queryOptions({
      queryKey: this.keys.reactionKeywords(variables.id),
      queryFn: () => ProductService.getReactionKeywords(variables),
      retry: RETRY,
    });
  }

  static keywordProducts(variables: KeywordProductsQueryVariables) {
    return queryOptions({
      queryKey: this.keys.keywordProducts(variables.keyword ?? ''),
      queryFn: () => ProductService.getKeywordProducts(variables),
      retry: RETRY,
    });
  }

  static categoryPopular(variables: CategoryProductsQueryVariables) {
    return queryOptions({
      // codegen 이 categoryIds 를 number | number[] 로 낸다(InputMaybe 특성).
      queryKey: this.keys.categoryPopular(
        Array.isArray(variables.categoryIds)
          ? variables.categoryIds[0] ?? 0
          : variables.categoryIds ?? 0,
      ),
      queryFn: () => ProductService.getCategoryProducts(variables),
      retry: RETRY,
    });
  }

  static guides(variables: ProductGuidesQueryVariables) {
    return queryOptions({
      queryKey: this.keys.guides(variables.productId),
      queryFn: () => ProductService.getProductGuides(variables),
      retry: RETRY,
    });
  }
}
