import { QueryHookOptions, useLazyQuery, useMutation, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationAddProductMappingMutation,
  MutationAddProductMappingMutationVariables,
  QueryBrandItemsByMatchCountTotalCountQuery,
  QueryBrandItemsByMatchCountTotalCountQueryVariables,
  QueryBrandItemsOrderByTotalMatchCountQuery,
  QueryBrandItemsOrderByTotalMatchCountQueryVariables,
  QueryBrandProductsOrderByMatchCountQuery,
  QueryBrandProductsOrderByMatchCountQueryVariables,
  QuerySimilarProductsByTitleQuery,
  QuerySimilarProductsByTitleQueryVariables,
} from '@/generated/gql/graphql';
import {
  MutationAddProductMapping,
  QueryBrandItemsByMatchCountTotalCount,
  QueryBrandItemsOrderByTotalMatchCount,
  QueryBrandProductsOrderByMatchCount,
  QuerySimilarProductsByTitle,
} from '@/graphql/brandProduct';

export type BrandProduct =
  QueryBrandProductsOrderByMatchCountQuery['brandProductsOrderByMatchCount'][number];

export const useGetBrandProductsOrderByMatchCountLazy = () => {
  return useLazyQuery<
    QueryBrandProductsOrderByMatchCountQuery,
    QueryBrandProductsOrderByMatchCountQueryVariables
  >(QueryBrandProductsOrderByMatchCount, {
    fetchPolicy: 'network-only',
  });
};

export type BrandItem =
  QueryBrandItemsOrderByTotalMatchCountQuery['brandItemsOrderByTotalMatchCount'][number];

export const useGetBrandItemsOrderByTotalMatchCount = (
  variables?: Partial<QueryBrandItemsOrderByTotalMatchCountQueryVariables>,
  options?: QueryHookOptions<
    QueryBrandItemsOrderByTotalMatchCountQuery,
    QueryBrandItemsOrderByTotalMatchCountQueryVariables
  >,
) => {
  return useQuery<
    QueryBrandItemsOrderByTotalMatchCountQuery,
    QueryBrandItemsOrderByTotalMatchCountQueryVariables
  >(QueryBrandItemsOrderByTotalMatchCount, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter ?? undefined,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetBrandItemsOrderByTotalMatchCountLazy = () => {
  return useLazyQuery<
    QueryBrandItemsOrderByTotalMatchCountQuery,
    QueryBrandItemsOrderByTotalMatchCountQueryVariables
  >(QueryBrandItemsOrderByTotalMatchCount, {
    fetchPolicy: 'network-only',
  });
};

export const useGetBrandItemsByMatchCountTotalCount = (
  variables?: QueryBrandItemsByMatchCountTotalCountQueryVariables,
  options?: QueryHookOptions<
    QueryBrandItemsByMatchCountTotalCountQuery,
    QueryBrandItemsByMatchCountTotalCountQueryVariables
  >,
) => {
  return useQuery<
    QueryBrandItemsByMatchCountTotalCountQuery,
    QueryBrandItemsByMatchCountTotalCountQueryVariables
  >(QueryBrandItemsByMatchCountTotalCount, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetBrandItemsByMatchCountTotalCountLazy = () => {
  return useLazyQuery<
    QueryBrandItemsByMatchCountTotalCountQuery,
    QueryBrandItemsByMatchCountTotalCountQueryVariables
  >(QueryBrandItemsByMatchCountTotalCount, {
    fetchPolicy: 'network-only',
  });
};

/** productMapping 은 서빙되는(verified) 매핑만 온다 — null 이면 미매핑이거나 pending 뿐인 딜 */
export type SimilarProductByTitle =
  QuerySimilarProductsByTitleQuery['similarProductsByTitle'][number];

export const useGetSimilarProductsByTitleLazy = () => {
  return useLazyQuery<QuerySimilarProductsByTitleQuery, QuerySimilarProductsByTitleQueryVariables>(
    QuerySimilarProductsByTitle,
    { fetchPolicy: 'network-only' },
  );
};

/** 어드민 수동 매핑 — 서버가 matched+verified 로 넣는다 (matching-api adminAddMapping) */
export const useAddProductMapping = () => {
  return useMutation<MutationAddProductMappingMutation, MutationAddProductMappingMutationVariables>(
    MutationAddProductMapping,
  );
};
