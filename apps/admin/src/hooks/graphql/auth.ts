import { MutationHookOptions, useMutation } from '@apollo/client';

import { MutationAdminLogin } from '@/graphql/auth';

interface TokenOutput {
  accessToken: string;
  refreshToken?: string;
}

interface AdminLoginVariable {
  email: string;
  password: string;
}

export const useMutationAdminLogin = (
  options?: MutationHookOptions<{ adminLogin: TokenOutput }, AdminLoginVariable>,
) => {
  return useMutation<{ adminLogin: TokenOutput }, AdminLoginVariable>(MutationAdminLogin, {
    ...options,
  });
};
