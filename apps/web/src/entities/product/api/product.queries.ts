import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import {
  ProductAdditionalInfoQueryVariables,
  ProductGuidesQueryVariables,
  ProductInfoQueryVariables,
  ProductQueryVariables,
  ProductStatsQueryVariables,
  QueryCategorizedReactionKeywordsArgs,
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryHotDealRankingProductsQueryVariables,
  QueryProductsByKeywordQueryVariables,
  QueryProductsQueryVariables,
  QueryReportUserNamesQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import { buildQueryKey } from '@/shared/api/query-key';

export const ProductQueries = {
  all: () => ['product'],
  product: (variables: ProductQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'detail', { id: variables.id }),
      queryFn: () => ProductService.getProduct(variables),
    }),
  productInfo: (variables: ProductInfoQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'detail', { id: variables.id }, 'info'),
      queryFn: () => ProductService.getProductInfo(variables),
      select: (data) => {
        if (!data) throw new Error('PRODUCT_NOT_FOUND');
        return data;
      },
    }),
  productStats: (variables: ProductStatsQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'detail', { id: variables.id }, 'stats'),
      queryFn: () => ProductService.getProductStats(variables),
      select: (data) => {
        if (!data) throw new Error('PRODUCT_STATS_NOT_FOUND');
        return data;
      },
    }),
  productAdditionalInfo: (variables: ProductAdditionalInfoQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'detail', { id: variables.id }, 'additionalInfo'),
      queryFn: () => ProductService.getProductAdditionalInfo(variables),
      select: (data) => {
        if (!data) throw new Error('PRODUCT_ADDITIONAL_INFO_NOT_FOUND');
        return data;
      },
    }),
  reportUserNames: (variables: QueryReportUserNamesQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'reportUserNames', { productId: variables.productId }),
      queryFn: () => ProductService.getReportUserNames(variables),
    }),
  productGuide: (variables: ProductGuidesQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'guide', { productId: variables.productId }),
      queryFn: () => ProductService.getProductGuides(variables),
    }),
  productKeywords: () =>
    queryOptions({
      queryKey: buildQueryKey('product', 'keywords'),
      queryFn: () => ProductService.getProductKeywords(),
    }),
  reactionKeywords: (variables: QueryCategorizedReactionKeywordsArgs) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'reactionKeywords', { id: variables.id }),
      queryFn: () => ProductService.getReactionKeywords(variables),
    }),
};
