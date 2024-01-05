export type ISignupOutput = {
  signup: {
    accessToken: string
    refreshToken: string
    user: SignupUser
  }
}

export type ISignupVariable = Omit<SignupUser, 'id' | 'linkedSocialProviders'> & {
  password: string
}

type SignupUser = {
  id: string
  email: string
  nickname: string
  birthYear: number
  gender: 'MALE' | 'FEMALE'
  favoriteCategories: number[]
  linkedSocialProviders: 'APPLE' | 'GOOLE' | 'KAKAO' | 'NAVER'
}
