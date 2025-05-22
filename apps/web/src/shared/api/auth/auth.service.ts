import { execute } from '@/shared/lib/http';

import { graphql } from '../gql';
import {
  MutationAddNotificationKeywordMutationVariables,
  MutationAddPushTokenMutationVariables,
  MutationLoginMutationVariables,
  MutationRemoveNotificationKeywordMutationVariables,
  MutationSignupMutationVariables,
  MutationUpdatePasswordMutationVariables,
  MutationUpdateUserProfileMutationVariables,
  QueryMypageKeywordQueryVariables,
} from '../gql/graphql';

export class AuthService {
  static async loginByRefreshTokenMutation() {
    return execute(MutationLoginByRefreshToken);
  }

  static async getMe() {
    return execute(QueryMe);
  }

  static async getMeServer() {
    return execute(QueryMe);
  }

  static async getMyKeyword(variables: QueryMypageKeywordQueryVariables) {
    return execute(QueryMypageKeyword, variables);
  }

  static async updateMe(variables: MutationUpdateUserProfileMutationVariables) {
    return execute(MutationUpdateUserProfile, variables);
  }

  static async signup(variables: MutationSignupMutationVariables) {
    return execute(MutationSignup, variables);
  }

  static async loginUser(variables: MutationLoginMutationVariables) {
    return execute(MutationLogin, variables);
  }

  static async addPushToken(variables: MutationAddPushTokenMutationVariables) {
    return execute(MutationAddPushToken, variables);
  }

  static async deleteUser() {
    return execute(MutationWithdraw);
  }

  static async updatePassword(variables: MutationUpdatePasswordMutationVariables) {
    return execute(UpdatePassword, variables);
  }

  static async updateKeyword(variables: MutationAddNotificationKeywordMutationVariables) {
    return execute(MutationAddNotificationKeyword, variables);
  }

  static async removeKeyword(variables: MutationRemoveNotificationKeywordMutationVariables) {
    return execute(MutationRemoveNotificationKeyword, variables);
  }
}

const QueryMe = graphql(`
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
`);

const MutationLoginByRefreshToken = graphql(`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);

const QueryMypageKeyword = graphql(`
  query QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {
    notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {
      id
      keyword
    }
  }
`);

const MutationUpdateUserProfile = graphql(`
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
`);

const MutationSignup = graphql(`
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
`);

const MutationLogin = graphql(`
  mutation MutationLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`);

const MutationAddPushToken = graphql(`
  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {
    addPushToken(token: $token, tokenType: $tokenType)
  }
`);

const UpdatePassword = graphql(`
  mutation MutationUpdatePassword($password: String!) {
    updatePassword(password: $password)
  }
`);

const MutationWithdraw = graphql(`
  mutation MutationWithdraw {
    withdraw
  }
`);

const MutationAddNotificationKeyword = graphql(`
  mutation MutationAddNotificationKeyword($keyword: String!) {
    addNotificationKeyword(keyword: $keyword)
  }
`);

const MutationRemoveNotificationKeyword = graphql(`
  mutation MutationRemoveNotificationKeyword($id: Float!) {
    removeNotificationKeyword(id: $id)
  }
`);
