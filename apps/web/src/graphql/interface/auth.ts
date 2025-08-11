import { type User } from '@/shared/api/gql/graphql';

export interface ISignupOutput {
  signup: {
    accessToken: string;
    refreshToken?: string;
    user: User;
  };
}

export type ISignupVariable = Pick<
  User,
  'email' | 'nickname' | 'birthYear' | 'gender' | 'favoriteCategories'
> & {
  password: string;
};
