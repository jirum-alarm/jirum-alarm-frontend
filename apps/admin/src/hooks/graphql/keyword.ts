import {
  MutationHookOptions,
  QueryHookOptions,
  SuspenseQueryHookOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@apollo/client';

import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationAddHotDealKeywordByAdminMutation,
  MutationRemoveHotDealKeywordByAdminMutation,
  MutationRemoveHotDealKeywordByAdminMutationVariables,
  MutationUpdateHotDealKeywordByAdminMutation,
  MutationUpdateHotDealKeywordByAdminMutationVariables,
  QueryHotDealKeywordByAdminQuery,
  QueryHotDealKeywordByAdminQueryVariables,
  QueryHotDealKeywordDetailByAdminQuery,
  QueryHotDealKeywordDetailByAdminQueryVariables,
  QueryHotDealKeywordsByAdminQuery,
} from '@/generated/gql/graphql';
import {
  MutationAddHotDealKeywordByAdmin,
  MutationRemoveHotDealKeywordByAdmin,
  MutationUpdateHotDealKeywordByAdmin,
  QueryHotDealKeywordByAdmin,
  QueryHotDealKeywordDetailByAdmin,
  QueryHotDealKeywordsByAdmin,
} from '@/graphql/keyword';
import { HotDealKeywordOrderType, HotDealKeywordType, OrderOptionType } from '@/types/keyword';

// 화면은 로컬 enum(@/types/keyword)을 쓴다 — 생성 enum 과 멤버 이름이 달라(POSITIVE vs Positive)
// 서로 대입되지 않으므로, enum 이 걸린 자리만 로컬 enum 으로 돌려 둔다
type WithLocalKeywordType<T> = T extends object
  ? Omit<T, 'type'> & { type: HotDealKeywordType }
  : T;

type HotDealKeywordsData = {
  hotDealKeywordsByAdmin: WithLocalKeywordType<
    QueryHotDealKeywordsByAdminQuery['hotDealKeywordsByAdmin'][number]
  >[];
};

type HotDealKeywordData = {
  hotDealKeywordByAdmin: WithLocalKeywordType<
    QueryHotDealKeywordByAdminQuery['hotDealKeywordByAdmin']
  >;
};

type HotDealKeywordDetailData = {
  hotDealKeywordByAdmin: WithLocalKeywordType<
    QueryHotDealKeywordDetailByAdminQuery['hotDealKeywordByAdmin']
  >;
};

interface AddHotDealKeywordVariable {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

export const useAddHotDealKeyword = (
  keywordType: HotDealKeywordType,
  options?: MutationHookOptions<
    MutationAddHotDealKeywordByAdminMutation,
    AddHotDealKeywordVariable
  >,
) => {
  return useMutation<MutationAddHotDealKeywordByAdminMutation, AddHotDealKeywordVariable>(
    MutationAddHotDealKeywordByAdmin,
    {
      refetchQueries: [
        {
          query: QueryHotDealKeywordsByAdmin,
          variables: {
            type: keywordType,
            orderBy: HotDealKeywordOrderType.WEIGHT,
            orderOption: OrderOptionType.DESC,
            limit: PAGE_LIMIT,
          },
        },
      ],
      ...options,
    },
  );
};

export const useRemoveHotDealKeyword = (
  keywordType: HotDealKeywordType,
  options?: MutationHookOptions<
    MutationRemoveHotDealKeywordByAdminMutation,
    MutationRemoveHotDealKeywordByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationRemoveHotDealKeywordByAdminMutation,
    MutationRemoveHotDealKeywordByAdminMutationVariables
  >(MutationRemoveHotDealKeywordByAdmin, {
    update(cache, { data }, option) {
      const { variables } = option;
      const existingKeywords = cache.readQuery({
        query: QueryHotDealKeywordsByAdmin,
        variables: {
          type: keywordType,
          orderBy: HotDealKeywordOrderType.WEIGHT,
          orderOption: OrderOptionType.DESC,
          limit: PAGE_LIMIT,
        },
      }) as HotDealKeywordsData | null;
      if (existingKeywords?.hotDealKeywordsByAdmin.length && data?.removeHotDealKeywordByAdmin) {
        cache.writeQuery({
          query: QueryHotDealKeywordsByAdmin,
          variables: {
            type: keywordType,
            orderBy: HotDealKeywordOrderType.WEIGHT,
            orderOption: OrderOptionType.DESC,
            limit: PAGE_LIMIT,
          },
          data: {
            hotDealKeywordsByAdmin: existingKeywords.hotDealKeywordsByAdmin.filter(
              (keyword) => Number(keyword.id) !== variables?.id,
            ),
          },
        });
      }
    },
    ...options,
  });
};

export const useUpdateHotDealKeyword = (
  keywordType: HotDealKeywordType,
  options?: MutationHookOptions<
    MutationUpdateHotDealKeywordByAdminMutation,
    MutationUpdateHotDealKeywordByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationUpdateHotDealKeywordByAdminMutation,
    MutationUpdateHotDealKeywordByAdminMutationVariables
  >(MutationUpdateHotDealKeywordByAdmin, {
    update(cache, { data }, option) {
      const { variables } = option;
      const existingKeywords = cache.readQuery({
        query: QueryHotDealKeywordsByAdmin,
        variables: {
          type: keywordType,
          orderBy: HotDealKeywordOrderType.WEIGHT,
          orderOption: OrderOptionType.DESC,
          limit: PAGE_LIMIT,
        },
      }) as HotDealKeywordsData | null;
      if (existingKeywords?.hotDealKeywordsByAdmin.length && data?.updateHotDealKeywordByAdmin) {
        cache.writeQuery({
          query: QueryHotDealKeywordsByAdmin,
          variables: {
            type: keywordType,
            orderBy: HotDealKeywordOrderType.WEIGHT,
            orderOption: OrderOptionType.DESC,
            limit: PAGE_LIMIT,
          },
          data: {
            hotDealKeywordsByAdmin: existingKeywords.hotDealKeywordsByAdmin.map((keyword) =>
              Number(keyword.id) === variables?.id ? { ...keyword, ...variables } : keyword,
            ),
          },
        });
      }
    },
    ...options,
  });
};

interface GetHotDealKeywordsVariables {
  type?: HotDealKeywordType;
  orderBy?: HotDealKeywordOrderType;
  orderOption?: OrderOptionType;
  limit?: number;
  searchAfter?: string[] | null;
}

export const useGetHotDealKeywords = (
  queryOptions?: SuspenseQueryHookOptions<HotDealKeywordsData, GetHotDealKeywordsVariables>,
) => {
  const { variables, ...rest } = queryOptions ?? {};

  return useSuspenseQuery<HotDealKeywordsData, GetHotDealKeywordsVariables>(
    QueryHotDealKeywordsByAdmin,
    {
      ...rest,
      variables: {
        type: variables?.type,
        orderBy: HotDealKeywordOrderType.WEIGHT,
        orderOption: variables?.orderOption ?? OrderOptionType.DESC,
        limit: variables?.limit ?? PAGE_LIMIT,
        searchAfter: variables?.searchAfter,
      },
    },
  );
};

export const useGetHotDealKeyword = (
  queryOptions?: QueryHookOptions<HotDealKeywordData, QueryHotDealKeywordByAdminQueryVariables>,
) => {
  const { variables, ...rest } = queryOptions ?? {};

  return useQuery<HotDealKeywordData, QueryHotDealKeywordByAdminQueryVariables>(
    QueryHotDealKeywordByAdmin,
    {
      ...rest,
      variables: {
        id: variables?.id ?? 1,
      },
    },
  );
};

export const useGetHotDealDetailKeyword = (
  queryOptions: QueryHookOptions<
    HotDealKeywordDetailData,
    QueryHotDealKeywordDetailByAdminQueryVariables
  >,
) => {
  return useQuery<HotDealKeywordDetailData, QueryHotDealKeywordDetailByAdminQueryVariables>(
    QueryHotDealKeywordDetailByAdmin,
    {
      ...queryOptions,
    },
  );
};
