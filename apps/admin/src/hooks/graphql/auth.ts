import { MutationAdminLogin } from '@/graphql/auth';
import { MutationHookOptions, useMutation } from '@apollo/client';

interface TokenOutput {
  accessToken: string;
  refreshToken: string;
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
