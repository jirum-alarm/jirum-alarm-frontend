import {
  ProductGuidesQueryVariables,
  ProductQueryVariables,
  QueryCommunityRandomRankingProductsQueryVariables,
  QueryProductsQueryVariables,
  TogetherViewedProductsQueryVariables,
} from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

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
};
