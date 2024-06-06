import {
  MutationAddHotDealKeywordByAdmin,
  QueryHotDealKeywordByAdmin,
  QueryHotDealKeywordsByAdmin,
} from '@/graphql/keyword';
import { HotDealKeywordOrderType, HotDealKeywordType, OrderOptionType } from '@/types/keyword';
import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

interface AddHotDealKeywordVariable {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

export const useAddHotDealKeyword = (
  options?: MutationHookOptions<any, AddHotDealKeywordVariable>,
) => {
  return useMutation<{ data: { addHotDealKeywordByAdmin: boolean } }, AddHotDealKeywordVariable>(
    MutationAddHotDealKeywordByAdmin,
    {
      refetchQueries: [
        {
          query: QueryHotDealKeywordByAdmin,
          variables: {
            orderBy: HotDealKeywordOrderType.ID,
            orderOption: OrderOptionType.ASC,
            limit: 10,
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
}

interface GetHotDealKeywordsVariables {
  orderBy: HotDealKeywordOrderType;
  orderOption: OrderOptionType;
  limit: number;
  searchAfter?: string[];
}

export const useGetHotDealKeywords = (
  queryOptions?: QueryHookOptions<any, GetHotDealKeywordsVariables>,
) => {
  const { variables, ...rest } = queryOptions ?? {};

  return useQuery<
    { hotDealKeywordsByAdmin: GetHotDealKeywordsData[] },
    GetHotDealKeywordsVariables
  >(QueryHotDealKeywordsByAdmin, {
    ...rest,
    variables: {
      orderBy: HotDealKeywordOrderType.ID,
      orderOption: variables?.orderOption ?? OrderOptionType.ASC,
      limit: variables?.limit ?? 10,
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
