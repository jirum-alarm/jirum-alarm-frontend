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
  products: (variables: QueryProductsQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'list', {
        limit: variables.limit,
        searchAfter: variables.searchAfter,
        startDate: variables.startDate,
        orderBy: variables.orderBy,
        orderOption: variables.orderOption,
        categoryId: variables.categoryId,
        keyword: variables.keyword,
        thumbnailType: variables.thumbnailType,
        isEnd: variables.isEnd,
        isHot: variables.isHot,
      }),
      queryFn: () => ProductService.getProducts(variables),
    }),
  hotdealProductsRandom: (variables: QueryCommunityRandomRankingProductsQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'random', {
        count: variables.count,
        limit: variables.limit,
      }),
      queryFn: () => ProductService.getHotDealProductsRandom(variables),
    }),
  infiniteProducts: (variables: QueryProductsQueryVariables) =>
    infiniteQueryOptions({
      queryKey: [...ProductQueries.products(variables).queryKey],
      queryFn: ({ pageParam }) =>
        ProductService.getProducts({ ...variables, searchAfter: pageParam }),
      initialPageParam: null as null | string,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.products.at(-1)?.searchAfter?.[0];
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

  togetherViewed: (variables: TogetherViewedProductsQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'viewed', {
        limit: variables.limit,
        productId: variables.productId,
      }),
      queryFn: () => ProductService.getTogetherViewedProducts(variables),
    }),
  productKeywords: () =>
    queryOptions({
      queryKey: buildQueryKey('product', 'keywords'),
      queryFn: () => ProductService.getProductKeywords(),
    }),
  productsByKeywords: (variables: QueryProductsByKeywordQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'productsByKeywords', {
        limit: variables.limit,
        searchAfter: variables.searchAfter,
        keyword: variables.keyword,
        orderBy: variables.orderBy,
        orderOption: variables.orderOption,
      }),
      queryFn: () => ProductService.getProductsByKeyword(variables),
    }),
  infiniteProductsByKeywords: (variables: QueryProductsByKeywordQueryVariables) =>
    infiniteQueryOptions({
      queryKey: [...ProductQueries.productsByKeywords(variables).queryKey],
      queryFn: ({ pageParam }) =>
        ProductService.getProductsByKeyword({
          ...variables,
          searchAfter: pageParam,
        }),
      initialPageParam: null as null | string,
      getNextPageParam: (lastPage, allPage) => {
        return lastPage.productsByKeyword?.at(-1)?.searchAfter?.[0];
      },
    }),

  reactionKeywords: (variables: QueryCategorizedReactionKeywordsArgs) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'reactionKeywords', { id: variables.id }),
      queryFn: () => ProductService.getReactionKeywords(variables),
    }),

  hotDealRankingProducts: (variables: QueryHotDealRankingProductsQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'hotDealRankingProducts', variables),
      queryFn: () => ProductService.getHotDealRankingProducts(variables),
    }),
};
