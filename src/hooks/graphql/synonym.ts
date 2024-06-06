import {
  MutationAddHotDealExcludeKeywordByAdmin,
  MutationAddHotDealKeywordSynonymByAdmin,
} from '@/graphql/synonym';
import { MutationHookOptions, useMutation } from '@apollo/client';

interface AddHotDealKeywordSynonymByAdminVariable {
  hotDealKeywordId: number;
  keyword: string;
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
  excludeKeyword: string;
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
