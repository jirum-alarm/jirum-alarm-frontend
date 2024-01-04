import { gql } from '@apollo/client'

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
      nickname
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
