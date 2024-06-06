import { MutationAddHotDealKeywordByAdmin } from '@/graphql/keyword';
import { HotDealKeywordType } from '@/types/keyword';
import { MutationHookOptions, useMutation } from '@apollo/client';

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

export { useAddHotDealKeyword };
