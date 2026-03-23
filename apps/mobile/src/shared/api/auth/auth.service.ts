import type {
  MutationLoginMutationVariables,
  MutationSocialLoginMutationVariables,
} from '@/shared/api/gql/graphql.ts';
import {HttpClient} from '@/shared/lib/client';
import {
  MutationLogin,
  MutationLoginByRefreshToken,
  MutationSocialLogin,
} from '@/graphql/auth.ts';

export class AuthService {
  static async loginUser(variables: MutationLoginMutationVariables) {
    return HttpClient.withNoAuth()
      .execute(MutationLogin, variables)
      .then(res => res.data);
  }
  static async loginByRefreshToken() {
    return HttpClient.withRefreshToken()
      .execute(MutationLoginByRefreshToken)
      .then(res => res.data);
  }
  static async socialLogin(variables: MutationSocialLoginMutationVariables) {
    return HttpClient.withNoAuth()
      .execute(MutationSocialLogin, variables)
      .then(res => res.data);
  }
}
