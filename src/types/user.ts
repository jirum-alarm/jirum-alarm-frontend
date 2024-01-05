export type User = {
  id: number
  email: string
  nickname: string
  birthYear: number
  gender: 'MALE' | 'FEMALE'
  favoriteCategories: number[]
  linkedSocialProviders: 'APPLE' | 'GOOLE' | 'KAKAO' | 'NAVER'
}

export interface IUsersOutput {
  users: User[]
}

export interface IUserProfile {
  name: string
}
