import { MutationHookOptions, QueryHookOptions, useMutation, useQuery } from '@apollo/client';

import { MutationAdminLogin, QueryAdminMe } from '@/graphql/auth';

interface TokenOutput {
  accessToken: string;
  refreshToken?: string;
}

interface AdminLoginVariable {
  email: string;
  password: string;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
}

interface QueryAdminMeData {
  adminMe: AdminUser;
}

export const useMutationAdminLogin = (
  options?: MutationHookOptions<{ adminLogin: TokenOutput }, AdminLoginVariable>,
) => {
  return useMutation<{ adminLogin: TokenOutput }, AdminLoginVariable>(MutationAdminLogin, {
    ...options,
  });
};

export const useAdminMe = (options?: QueryHookOptions<QueryAdminMeData>) => {
  return useQuery<QueryAdminMeData>(QueryAdminMe, {
    fetchPolicy: 'cache-first',
    ...options,
  });
};
