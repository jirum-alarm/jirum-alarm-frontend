import {
  MutationAddHotDealExcludeKeywordByAdmin,
  MutationAddHotDealKeywordSynonymByAdmin,
  MutationRemoveHotDealExcludeKeywordByAdmin,
  MutationRemoveHotDealKeywordSynonymByAdmin,
} from '@/graphql/synonym';
import { MutationHookOptions, useMutation } from '@apollo/client';

interface AddHotDealKeywordSynonymByAdminVariable {
  hotDealKeywordId: number;
  keyword: string[];
}

export const useAddHotDealKeywordSynonymByAdmin = (
  options?: MutationHookOptions<any, AddHotDealKeywordSynonymByAdminVariable>,
) => {
  return useMutation<
    { data: { addHotDealKeywordSynonymByAdmin: number } },
    AddHotDealKeywordSynonymByAdminVariable
  >(MutationAddHotDealKeywordSynonymByAdmin, {
    ...options,
  });
};

interface AddHotDealExcludeKeywordByAdminVariable {
  hotDealKeywordId: number;
  excludeKeyword: string[];
}

export const useAddHotDealExcludeKeywordByAdmin = (
  options?: MutationHookOptions<any, AddHotDealExcludeKeywordByAdminVariable>,
) => {
  return useMutation<
    { data: { addHotDealExcludeKeywordByAdmin: number } },
    AddHotDealExcludeKeywordByAdminVariable
  >(MutationAddHotDealExcludeKeywordByAdmin, {
    ...options,
  });
};

interface RemoveHotDealKeywordSynonymVariable {
  ids: number[];
}

export const useRemoveHotDealKeywordSynonym = (
  options?: MutationHookOptions<any, RemoveHotDealKeywordSynonymVariable>,
) => {
  return useMutation<
    { data: { removeHotDealKeywordSynonymByAdmin: boolean } },
    RemoveHotDealKeywordSynonymVariable
  >(MutationRemoveHotDealKeywordSynonymByAdmin, {
    ...options,
  });
};

interface RemoveHotDealExcludeKeywordVariable {
  ids: number[];
}

export const useRemoveHotDealExcludeKeyword = (
  options?: MutationHookOptions<any, RemoveHotDealExcludeKeywordVariable>,
) => {
  return useMutation<
    { data: { removeHotDealExcludeKeywordByAdmin: boolean } },
    RemoveHotDealExcludeKeywordVariable
  >(MutationRemoveHotDealExcludeKeywordByAdmin, {
    ...options,
  });
};
