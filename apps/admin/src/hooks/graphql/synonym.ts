import { MutationHookOptions, useMutation } from '@apollo/client';

import { QueryHotDealKeywordByAdmin } from '@/graphql/keyword';
import {
  MutationAddHotDealExcludeKeywordByAdmin,
  MutationAddHotDealKeywordSynonymByAdmin,
  MutationRemoveHotDealExcludeKeywordByAdmin,
  MutationRemoveHotDealKeywordSynonymByAdmin,
} from '@/graphql/synonym';

interface AddHotDealKeywordSynonymByAdminVariable {
  hotDealKeywordId: number;
  keywords: string[];
}

export const useAddHotDealKeywordSynonymByAdmin = (
  keywordId: number,
  options?: MutationHookOptions<any, AddHotDealKeywordSynonymByAdminVariable>,
) => {
  return useMutation<
    { data: { addHotDealKeywordSynonymByAdmin: number } },
    AddHotDealKeywordSynonymByAdminVariable
  >(MutationAddHotDealKeywordSynonymByAdmin, {
    refetchQueries: [
      {
        query: QueryHotDealKeywordByAdmin,
        variables: {
          id: keywordId,
        },
      },
    ],
    ...options,
  });
};

interface AddHotDealExcludeKeywordByAdminVariable {
  hotDealKeywordId: number;
  excludeKeywords: string[];
}

export const useAddHotDealExcludeKeywordByAdmin = (
  keywordId: number,
  options?: MutationHookOptions<any, AddHotDealExcludeKeywordByAdminVariable>,
) => {
  return useMutation<
    { data: { addHotDealExcludeKeywordByAdmin: number } },
    AddHotDealExcludeKeywordByAdminVariable
  >(MutationAddHotDealExcludeKeywordByAdmin, {
    refetchQueries: [
      {
        query: QueryHotDealKeywordByAdmin,
        variables: {
          id: keywordId,
        },
      },
    ],
    ...options,
  });
};

interface RemoveHotDealKeywordSynonymVariable {
  ids: number[];
}

export const useRemoveHotDealKeywordSynonym = (
  keywordId: number,
  options?: MutationHookOptions<any, RemoveHotDealKeywordSynonymVariable>,
) => {
  return useMutation<
    { data: { removeHotDealKeywordSynonymByAdmin: boolean } },
    RemoveHotDealKeywordSynonymVariable
  >(MutationRemoveHotDealKeywordSynonymByAdmin, {
    refetchQueries: [
      {
        query: QueryHotDealKeywordByAdmin,
        variables: {
          id: keywordId,
        },
      },
    ],
    ...options,
  });
};

interface RemoveHotDealExcludeKeywordVariable {
  ids: number[];
}

export const useRemoveHotDealExcludeKeyword = (
  keywordId: number,
  options?: MutationHookOptions<any, RemoveHotDealExcludeKeywordVariable>,
) => {
  return useMutation<
    { data: { removeHotDealExcludeKeywordByAdmin: boolean } },
    RemoveHotDealExcludeKeywordVariable
  >(MutationRemoveHotDealExcludeKeywordByAdmin, {
    refetchQueries: [
      {
        query: QueryHotDealKeywordByAdmin,
        variables: {
          id: keywordId,
        },
      },
    ],
    ...options,
  });
};
