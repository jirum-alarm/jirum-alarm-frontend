import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import { MutationSetTossSession, QueryHasTossSession } from '@/graphql/profitLink';

export const useQueryHasTossSession = (options?: QueryHookOptions<{ hasTossSession: boolean }>) => {
  return useQuery<{ hasTossSession: boolean }>(QueryHasTossSession, {
    fetchPolicy: 'network-only',
    ...options,
  });
};

export const useMutationSetTossSession = (
  options?: MutationHookOptions<{ setTossSession: boolean }, { token: string }>,
) => {
  return useMutation<{ setTossSession: boolean }, { token: string }>(MutationSetTossSession, {
    ...options,
  });
};
