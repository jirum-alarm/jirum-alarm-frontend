import { useMutation } from '@apollo/client/react';

import {
  MutationAddHotDealExcludeKeywordByAdminMutation,
  MutationAddHotDealExcludeKeywordByAdminMutationVariables,
  MutationAddHotDealKeywordSynonymByAdminMutation,
  MutationAddHotDealKeywordSynonymByAdminMutationVariables,
  MutationRemoveHotDealExcludeKeywordByAdminMutation,
  MutationRemoveHotDealExcludeKeywordByAdminMutationVariables,
  MutationRemoveHotDealKeywordSynonymByAdminMutation,
  MutationRemoveHotDealKeywordSynonymByAdminMutationVariables,
} from '@/generated/gql/graphql';
import { QueryHotDealKeywordByAdmin } from '@/graphql/keyword';
import {
  MutationAddHotDealExcludeKeywordByAdmin,
  MutationAddHotDealKeywordSynonymByAdmin,
  MutationRemoveHotDealExcludeKeywordByAdmin,
  MutationRemoveHotDealKeywordSynonymByAdmin,
} from '@/graphql/synonym';

export const useAddHotDealKeywordSynonymByAdmin = (
  keywordId: number,
  options?: useMutation.Options<
    MutationAddHotDealKeywordSynonymByAdminMutation,
    MutationAddHotDealKeywordSynonymByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationAddHotDealKeywordSynonymByAdminMutation,
    MutationAddHotDealKeywordSynonymByAdminMutationVariables
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

export const useAddHotDealExcludeKeywordByAdmin = (
  keywordId: number,
  options?: useMutation.Options<
    MutationAddHotDealExcludeKeywordByAdminMutation,
    MutationAddHotDealExcludeKeywordByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationAddHotDealExcludeKeywordByAdminMutation,
    MutationAddHotDealExcludeKeywordByAdminMutationVariables
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

export const useRemoveHotDealKeywordSynonym = (
  keywordId: number,
  options?: useMutation.Options<
    MutationRemoveHotDealKeywordSynonymByAdminMutation,
    MutationRemoveHotDealKeywordSynonymByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationRemoveHotDealKeywordSynonymByAdminMutation,
    MutationRemoveHotDealKeywordSynonymByAdminMutationVariables
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

export const useRemoveHotDealExcludeKeyword = (
  keywordId: number,
  options?: useMutation.Options<
    MutationRemoveHotDealExcludeKeywordByAdminMutation,
    MutationRemoveHotDealExcludeKeywordByAdminMutationVariables
  >,
) => {
  return useMutation<
    MutationRemoveHotDealExcludeKeywordByAdminMutation,
    MutationRemoveHotDealExcludeKeywordByAdminMutationVariables
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
