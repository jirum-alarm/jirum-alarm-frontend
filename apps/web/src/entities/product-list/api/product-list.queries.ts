import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import {
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryHotDealRankingProductsQueryVariables,
  QueryProductsByKeywordQueryVariables,
  QueryProductsQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import { buildQueryKey } from '@/shared/api/query-key';

export const ProductListQueries = {
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
      queryKey: [...ProductListQueries.products(variables).queryKey],
      queryFn: ({ pageParam }) =>
        ProductService.getProducts({ ...variables, searchAfter: pageParam }),
      initialPageParam: null as null | string,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.products.at(-1)?.searchAfter?.[0];
      },
    }),
  togetherViewed: (variables: TogetherViewedProductsQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'viewed', {
        limit: variables.limit,
        productId: variables.productId,
      }),
      queryFn: () => ProductService.getTogetherViewedProducts(variables),
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
      queryKey: [...ProductListQueries.productsByKeywords(variables).queryKey],
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
  hotDealRankingProducts: (variables: QueryHotDealRankingProductsQueryVariables) =>
    queryOptions({
      queryKey: buildQueryKey('product', 'hotDealRankingProducts', variables),
      queryFn: () => ProductService.getHotDealRankingProducts(variables),
    }),
};
