import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import {
  ProductGuidesQueryVariables,
  ProductQueryVariables,
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryProductsByKeywordQueryVariables,
  QueryProductsQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';

export const ProductQueries = {
  all: () => ['product'],
  ranking: () =>
    queryOptions({
      queryKey: [...ProductQueries.all(), 'ranking'],
      queryFn: () => ProductService.getRankingProducts(),
    }),
  product: (variables: ProductQueryVariables) =>
    queryOptions({
      queryKey: [
        ...ProductQueries.all(),
        'detail',
        {
          id: variables.id,
        },
      ],
      queryFn: () => ProductService.getProduct(variables),
    }),
  productServer: (variables: ProductQueryVariables) =>
    queryOptions({
      queryKey: [
        ...ProductQueries.all(),
        'detail',
        {
          id: variables.id,
        },
      ],
      queryFn: () => ProductService.getProductServer(variables),
    }),
  products: (variables: QueryProductsQueryVariables) =>
    queryOptions({
      queryKey: [
        ...ProductQueries.all(),
        {
          limit: variables.categoryId,
          searchAfter: variables.searchAfter,
          startDate: variables.startDate,
          orderBy: variables.orderBy,
          orderOption: variables.orderOption,
          categoryId: variables.categoryId,
          keyword: variables.keyword,
          thumbnailType: variables.thumbnailType,
          isEnd: variables.isEnd,
          isHot: variables.isHot,
        },
      ],
      queryFn: () => ProductService.getProducts(variables),
    }),
  hotdealProductsRandom: (variables: QueryCommunityRandomRankingProductsQueryVariables) =>
    queryOptions({
      queryKey: [
        ...ProductQueries.all(),
        'random',
        {
          count: variables.count,
          limit: variables.limit,
        },
      ],
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
  productGuide: (variables: ProductGuidesQueryVariables) =>
    queryOptions({
      queryKey: [...ProductQueries.all(), 'guide', { productId: variables.productId }],
      queryFn: () => ProductService.getProductGuides(variables),
    }),

  togetherViewed: (variables: TogetherViewedProductsQueryVariables) =>
    queryOptions({
      queryKey: [
        ...ProductQueries.all(),
        'viewed',
        {
          limit: variables.limit,
          productId: variables.productId,
        },
      ],
      queryFn: () => ProductService.getTogetherViewedProducts(variables),
    }),
  productKeywords: () =>
    queryOptions({
      queryKey: [...ProductQueries.all(), 'keywords'],
      queryFn: () => ProductService.getProductKeywords(),
    }),
  productsByKeywords: (variables: QueryProductsByKeywordQueryVariables) =>
    queryOptions({
      queryKey: [
        ...ProductQueries.all(),
        'productsByKeywords',
        {
          limit: variables.limit,
          searchAfter: variables.searchAfter,
          keyword: variables.keyword,
          orderBy: variables.orderBy,
          orderOption: variables.orderOption,
        },
      ],
      queryFn: () => ProductService.getProductsByKeyword(variables),
    }),
  infiniteProductsByKeywords: (variables: QueryProductsByKeywordQueryVariables) =>
    infiniteQueryOptions({
      queryKey: [...ProductQueries.productsByKeywords(variables).queryKey],
      queryFn: ({ pageParam }) =>
        ProductService.getProductsByKeyword({ ...variables, searchAfter: pageParam }),
      initialPageParam: null as null | string,
      getNextPageParam: (lastPage, allPage) => {
        return lastPage.productsByKeyword?.at(-1)?.searchAfter?.[0];
      },
    }),
};
