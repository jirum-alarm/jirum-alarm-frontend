import { PAGE_LIMIT } from '@/constants/limit';
import {
  MutationAddHotDealKeywordByAdmin,
  MutationRemoveHotDealKeywordByAdmin,
  MutationUpdateHotDealKeywordByAdmin,
  QueryHotDealKeywordByAdmin,
  QueryHotDealKeywordDetailByAdmin,
  QueryHotDealKeywordsByAdmin,
} from '@/graphql/keyword';
import { HotDealKeywordOrderType, HotDealKeywordType, OrderOptionType } from '@/types/keyword';
import {
  MutationHookOptions,
  QueryHookOptions,
  SuspenseQueryHookOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from '@apollo/client';

interface AddHotDealKeywordVariable {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

export const useAddHotDealKeyword = (
  keywordType: HotDealKeywordType,
  options?: MutationHookOptions<any, AddHotDealKeywordVariable>,
) => {
  return useMutation<{ addHotDealKeywordByAdmin: boolean }, AddHotDealKeywordVariable>(
    MutationAddHotDealKeywordByAdmin,
    {
      refetchQueries: [
        {
          query: QueryHotDealKeywordsByAdmin,
          variables: {
            type: keywordType,
            orderBy: HotDealKeywordOrderType.ID,
            orderOption: OrderOptionType.ASC,
            limit: PAGE_LIMIT,
          },
        },
      ],
      ...options,
    },
  );
};

interface removeHotDealKeywordVariables {
  id: number;
}

export const useRemoveHotDealKeyword = (
  keywordType: HotDealKeywordType,
  options?: MutationHookOptions<any, removeHotDealKeywordVariables>,
) => {
  return useMutation<{ removeHotDealKeywordByAdmin: boolean }, removeHotDealKeywordVariables>(
    MutationRemoveHotDealKeywordByAdmin,
    {
      update(cache, { data }, option) {
        const { variables } = option;
        const existingKeywords = cache.readQuery({
          query: QueryHotDealKeywordsByAdmin,
          variables: {
            type: keywordType,
            orderBy: HotDealKeywordOrderType.ID,
            orderOption: OrderOptionType.ASC,
            limit: PAGE_LIMIT,
          },
        }) as { hotDealKeywordsByAdmin: GetHotDealKeywordsData[] } | null;
        if (existingKeywords?.hotDealKeywordsByAdmin.length && data?.removeHotDealKeywordByAdmin) {
          cache.writeQuery({
            query: QueryHotDealKeywordsByAdmin,
            variables: {
              type: keywordType,
              orderBy: HotDealKeywordOrderType.ID,
              orderOption: OrderOptionType.ASC,
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
    },
  );
};

interface updateHotDealKeywordVariables {
  id: number;
  keyword?: string;
  weight?: number;
  isMajor?: boolean;
}

export const useUpdateHotDealKeyword = (
  keywordType: HotDealKeywordType,
  options?: MutationHookOptions<any, updateHotDealKeywordVariables>,
) => {
  return useMutation<{ updateHotDealKeywordByAdmin: boolean }, updateHotDealKeywordVariables>(
    MutationUpdateHotDealKeywordByAdmin,
    {
      refetchQueries: [
        {
          query: QueryHotDealKeywordsByAdmin,
          variables: {
            type: keywordType,
            orderBy: HotDealKeywordOrderType.ID,
            orderOption: OrderOptionType.ASC,
            limit: PAGE_LIMIT,
          },
        },
      ],
      ...options,
    },
  );
};

interface GetHotDealKeywordsData {
  id: number;
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
  synonymCount: number;
  excludeKeywordCount: number;
  searchAfter?: string[];
}

interface GetHotDealKeywordsVariables {
  type?: HotDealKeywordType;
  orderBy?: HotDealKeywordOrderType;
  orderOption?: OrderOptionType;
  limit?: number;
  searchAfter?: string[];
}

export const useGetHotDealKeywords = (
  queryOptions?: SuspenseQueryHookOptions<any, GetHotDealKeywordsVariables>,
) => {
  const { variables, ...rest } = queryOptions ?? {};

  return useSuspenseQuery<
    { hotDealKeywordsByAdmin: GetHotDealKeywordsData[] },
    GetHotDealKeywordsVariables
  >(QueryHotDealKeywordsByAdmin, {
    ...rest,
    variables: {
      type: variables?.type,
      orderBy: HotDealKeywordOrderType.ID,
      orderOption: variables?.orderOption ?? OrderOptionType.ASC,
      limit: variables?.limit ?? PAGE_LIMIT,
      searchAfter: variables?.searchAfter,
    },
  });
};

interface GetHotDealKeywordData {
  id: number;
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
  synonyms: Array<{ id: number; hotDealKeywordId: number; keyword: string }>;
  excludeKeywords: Array<{ id: number; hotDealKeywordId: number; excludeKeyword: string }>;
}

interface GetHotDealKeywordVariables {
  id: number;
}

export const useGetHotDealKeyword = (
  queryOptions?: QueryHookOptions<any, GetHotDealKeywordVariables>,
) => {
  const { variables, ...rest } = queryOptions ?? {};

  return useQuery<{ hotDealKeywordByAdmin: GetHotDealKeywordData }, GetHotDealKeywordVariables>(
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
    { hotDealKeywordByAdmin: Omit<GetHotDealKeywordData, 'synonyms' | 'excludeKeywords'> },
    GetHotDealKeywordVariables
  >,
) => {
  return useQuery<
    { hotDealKeywordByAdmin: Omit<GetHotDealKeywordData, 'synonyms' | 'excludeKeywords'> },
    GetHotDealKeywordVariables
  >(QueryHotDealKeywordDetailByAdmin, {
    ...queryOptions,
  });
};
