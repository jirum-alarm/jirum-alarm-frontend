import { http } from '@/shared/lib/http';

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
    return http.execute(MutationLoginByRefreshToken);
  }

  static async getMe() {
    return http.execute(QueryMe);
  }

  static async getMeServer(cookieHeader: string) {
    return http.executeServer(cookieHeader, QueryMe);
  }

  static async getMyKeyword(variables: QueryMypageKeywordQueryVariables) {
    return http.execute(QueryMypageKeyword, variables);
  }

  static async updateMe(variables: MutationUpdateUserProfileMutationVariables) {
    return http.execute(MutationUpdateUserProfile, variables);
  }

  static async signup(variables: MutationSignupMutationVariables) {
    return http.execute(MutationSignup, variables);
  }

  static async loginUser(variables: MutationLoginMutationVariables) {
    return http.execute(MutationLogin, variables);
  }

  static async addPushToken(variables: MutationAddPushTokenMutationVariables) {
    return http.execute(MutationAddPushToken, variables);
  }

  static async deleteUser() {
    return http.execute(MutationWithdraw);
  }

  static async updatePassword(variables: MutationUpdatePasswordMutationVariables) {
    return http.execute(UpdatePassword, variables);
  }

  static async updateKeyword(variables: MutationAddNotificationKeywordMutationVariables) {
    return http.execute(MutationAddNotificationKeyword, variables);
  }

  static async removeKeyword(variables: MutationRemoveNotificationKeywordMutationVariables) {
    return http.execute(MutationRemoveNotificationKeyword, variables);
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
