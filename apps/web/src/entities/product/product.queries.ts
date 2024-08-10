import { QueryProductsQueryVariables } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

export const ProductQueries = {
  all: () => ['product'],
  ranking: () =>
    queryOptions({
      queryKey: [...ProductQueries.all(), 'ranking'],
      queryFn: () => ProductService.getRankingProducts(),
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
};
