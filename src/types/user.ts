export type User = {
  id: number
  email: string
  nickname: string
}

export interface IUsersOutput {
  users: User[]
}

export interface IUserProfile {
  name: string
}
