import { User } from '@/types/user'

export type ISignupOutput = {
  signup: {
    accessToken: string
    refreshToken: string
    user: User
  }
}

export type ISignupVariable = Pick<
  User,
  'email' | 'nickname' | 'birthYear' | 'gender' | 'favoriteCategories'
> & {
  password: string
}
