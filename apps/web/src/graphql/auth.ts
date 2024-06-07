import { gql } from '@apollo/client';

export const MutationLogin = gql`
  mutation MutationLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`;

export const MutationSignup = gql`
  mutation MutationSignup(
    $email: String!
    $password: String!
    $nickname: String!
    $birthYear: Float
    $gender: Gender
    $favoriteCategories: [Int!]
  ) {
    signup(
      email: $email
      password: $password
      nickname: $nickname
      birthYear: $birthYear
      gender: $gender
      favoriteCategories: $favoriteCategories
    ) {
      accessToken
      refreshToken
      user {
        id
        email
        nickname
        birthYear
        gender
        favoriteCategories
        linkedSocialProviders
      }
    }
  }
`;

export const MutationUpdateUserProfile = gql`
  mutation MutationUpdateUserProfile(
    $nickname: String
    $birthYear: Float
    $gender: Gender
    $favoriteCategories: [Int!]
  ) {
    updateUserProfile(
      nickname: $nickname
      birthYear: $birthYear
      gender: $gender
      favoriteCategories: $favoriteCategories
    )
  }
`;

export const QueryLogout = gql`
  query QueryLogout {
    logout
  }
`;

export const QueryMe = gql`
  query QueryMe {
    me {
      id
      email
      nickname
      birthYear
      gender
      favoriteCategories
    }
  }
`;

export const MutationLoginByRefreshToken = gql`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`;

export const MutationUpdatePassword = gql`
  mutation MutationUpdatePassword($password: String!) {
    updatePassword(password: $password)
  }
`;

export const MutationWithdraw = gql`
  mutation MutationWithdraw {
    withdraw
  }
`;
