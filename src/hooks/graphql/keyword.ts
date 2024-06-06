import { MutationAddHotDealKeywordByAdmin, QueryHotDealKeywordsByAdmin } from '@/graphql/keyword';
import { HotDealKeywordOrderType, HotDealKeywordType, OrderOptionType } from '@/types/keyword';
import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

interface AddHotDealKeywordVariable {
  type: HotDealKeywordType;
  keyword: string;
  weight: number;
  isMajor: boolean;
}

const useAddHotDealKeyword = (options: MutationHookOptions<any, AddHotDealKeywordVariable>) => {
  return useMutation<{ data: { addHotDealKeywordByAdmin: boolean } }, AddHotDealKeywordVariable>(
    MutationAddHotDealKeywordByAdmin,
    {
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

const useGetHotDealKeywords = (
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

export { useAddHotDealKeyword, useGetHotDealKeywords };
