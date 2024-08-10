import { httpClient } from '@/shared/lib/http-client';
import { graphql } from '../gql';
import {
  MutationAddNotificationKeywordMutationVariables,
  MutationLoginMutationVariables,
  MutationRemoveNotificationKeywordMutationVariables,
  MutationUpdatePasswordMutationVariables,
  MutationUpdateUserProfileMutationVariables,
  QueryMypageKeywordQueryVariables,
} from '../gql/graphql';

export class AuthService {
  static async loginByRefreshTokenMutation() {
    return httpClient.execute(MutationLoginByRefreshToken).then((res) => res.data);
  }
  static async getMe() {
    return httpClient.execute(QueryMe).then((res) => res.data);
  }
  static async getMyKeyword(variables: QueryMypageKeywordQueryVariables) {
    return httpClient.execute(QueryMypageKeyword, variables).then((res) => res.data);
  }
  static async updateMe(variables: MutationUpdateUserProfileMutationVariables) {
    return httpClient.execute(MutationUpdateUserProfile, variables).then((res) => res.data);
  }
  static async loginUser(variables: MutationLoginMutationVariables) {
    return httpClient.execute(MutationLogin, variables).then((res) => res.data);
  }
  static async deleteUser() {
    return httpClient.execute(MutationWithdraw).then((res) => res.data);
  }
  static async updatePassword(variables: MutationUpdatePasswordMutationVariables) {
    return httpClient.execute(UpdatePassword, variables).then((res) => res.data);
  }
  static async updateKeyword(variables: MutationAddNotificationKeywordMutationVariables) {
    return httpClient.execute(MutationAddNotificationKeyword, variables).then((res) => res.data);
  }
  static async removeKeyword(variables: MutationRemoveNotificationKeywordMutationVariables) {
    return httpClient.execute(MutationRemoveNotificationKeyword, variables).then((res) => res.data);
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
const MutationLogin = graphql(`
  mutation MutationLogin($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
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
