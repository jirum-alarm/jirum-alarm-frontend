import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationHardDeleteProductByAdminMutation,
  MutationHardDeleteProductByAdminMutationVariables,
  OrderOptionType,
  ProductOrderType,
  QueryProductQuery,
  QueryProductQueryVariables,
  QueryProductsQuery,
  QueryProductsQueryVariables,
} from '@/generated/gql/graphql';
import { MutationHardDeleteProductByAdmin, QueryProduct, QueryProducts } from '@/graphql/product';

// 스키마는 categoryIds(목록)만 받는다 — 화면은 단일 선택이라 훅이 categoryId 를 받아 감싼다
export type GetProductsVariables = Omit<Partial<QueryProductsQueryVariables>, 'categoryIds'> & {
  categoryId?: number;
};

export const useGetProducts = (
  variables?: GetProductsVariables,
  options?: QueryHookOptions<QueryProductsQuery, QueryProductsQueryVariables>,
) => {
  return useQuery<QueryProductsQuery, QueryProductsQueryVariables>(QueryProducts, {
    variables: {
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter,
      orderBy: variables?.orderBy ?? ProductOrderType.PostedAt,
      orderOption: variables?.orderOption ?? OrderOptionType.Desc,
      categoryIds: variables?.categoryId != null ? [variables.categoryId] : undefined,
      keyword: variables?.keyword,
      isEnd: variables?.isEnd,
      isHot: variables?.isHot,
    },
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useGetProduct = (
  variables: QueryProductQueryVariables,
  options?: Omit<QueryHookOptions<QueryProductQuery, QueryProductQueryVariables>, 'variables'>,
) => {
  return useQuery<QueryProductQuery, QueryProductQueryVariables>(QueryProduct, {
    variables,
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useHardDeleteProductByAdmin = (
  options?: MutationHookOptions<
    MutationHardDeleteProductByAdminMutation,
    MutationHardDeleteProductByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationHardDeleteProductByAdminMutation,
    MutationHardDeleteProductByAdminMutationVariables
  >(MutationHardDeleteProductByAdmin, options);
};
