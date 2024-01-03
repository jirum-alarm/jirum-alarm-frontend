import { gql } from '@apollo/client'

enum Gender {
  FEMALE = 'FEMALE',
  MALE = 'MALE',
}

enum OauthProvider {
  APPLE = 'APPLE',
  GOOGLE = 'GOOGLE',
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
}

interface User {
  id: number
  email: string
  birthYear: number
  gender: Gender
  favoriteCategories: number[]
  linkedSocialProviders: OauthProvider[]
}

export const MutationLogin = gql`
  mutation MutationLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`

export const QueryLogout = gql`
  query QueryLogout {
    logout
  }
`

export const QueryMe = gql`
  query QueryMe {
    me {
      id
      email
    }
  }
`

export const QueryLoginByRefreshToken = gql`
  query QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`
