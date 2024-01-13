import { User } from '@/types/user';

export interface ISignupOutput {
  signup: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export type ISignupVariable = Pick<
  User,
  'email' | 'nickname' | 'birthYear' | 'gender' | 'favoriteCategories'
> & {
  password: string;
};
