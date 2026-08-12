import {queryOptions} from '@tanstack/react-query';

import {ProductService} from '@/shared/api/product/product.service.ts';
import type {
  ProductGuidesQueryVariables,
  ProductInfoQueryVariables,
  ProductStatsQueryVariables,
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

  static guides(variables: ProductGuidesQueryVariables) {
    return queryOptions({
      queryKey: this.keys.guides(variables.productId),
      queryFn: () => ProductService.getProductGuides(variables),
      retry: RETRY,
    });
  }
}
