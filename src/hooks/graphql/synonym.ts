import {
  MutationAddHotDealExcludeKeywordByAdmin,
  MutationAddHotDealKeywordSynonymByAdmin,
} from '@/graphql/synonym';
import { MutationHookOptions, useMutation } from '@apollo/client';

interface AddHotDealKeywordSynonymByAdminVariable {
  hotDealKeywordId: number;
  keyword: string;
}

const useAddHotDealKeywordSynonymByAdmin = (
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

const useAddHotDealExcludeKeywordByAdmin = (
  options?: MutationHookOptions<any, AddHotDealExcludeKeywordByAdminVariable>,
) => {
  return useMutation<
    { data: { addHotDealExcludeKeywordByAdmin: number } },
    AddHotDealExcludeKeywordByAdminVariable
  >(MutationAddHotDealExcludeKeywordByAdmin, {
    ...options,
  });
};

export { useAddHotDealKeywordSynonymByAdmin, useAddHotDealExcludeKeywordByAdmin };
