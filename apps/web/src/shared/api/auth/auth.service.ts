import { redirect } from 'next/navigation';

import { PAGE } from '@/constants/page';
import { execute } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import {
  MutationAddNotificationKeywordMutationVariables,
  MutationAddUserDeviceMutationVariables,
  MutationLoginMutationVariables,
  MutationRemoveNotificationKeywordMutationVariables,
  MutationSignupMutationVariables,
  MutationUpdatePasswordMutationVariables,
  MutationUpdateUserProfileMutationVariables,
  QueryMypageKeywordQueryVariables,
} from '../gql/graphql';

export class AuthService {
  static async loginByRefreshTokenMutation() {
    return execute(MutationLoginByRefreshToken).then((res) => res.data);
  }

  static async getMe() {
    return execute(QueryMe)
      .then((res) => res.data)
      .catch(() => {
        redirect(PAGE.LOGIN);
      });
  }

  static async getMyKeyword(variables: QueryMypageKeywordQueryVariables) {
    return execute(QueryMypageKeyword, variables).then((res) => res.data);
  }

  static async updateMe(variables: MutationUpdateUserProfileMutationVariables) {
    return execute(MutationUpdateUserProfile, variables).then((res) => res.data);
  }

  static async loginUser(variables: MutationLoginMutationVariables) {
    return execute(MutationLogin, variables).then((res) => res.data);
  }

  static async signupUser(variables: MutationSignupMutationVariables) {
    return execute(MutationSignup, variables).then((res) => res.data);
  }

  static async deleteUser() {
    return execute(MutationWithdraw).then((res) => res.data);
  }

  static async updatePassword(variables: MutationUpdatePasswordMutationVariables) {
    return execute(UpdatePassword, variables).then((res) => res.data);
  }

  static async updateKeyword(variables: MutationAddNotificationKeywordMutationVariables) {
    return execute(MutationAddNotificationKeyword, variables).then((res) => res.data);
  }

  static async removeKeyword(variables: MutationRemoveNotificationKeywordMutationVariables) {
    return execute(MutationRemoveNotificationKeyword, variables).then((res) => res.data);
  }

  static async addUserDevice(variables: MutationAddUserDeviceMutationVariables) {
    return execute(MutationAddUserDevice, variables).then((res) => res.data);
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

const MutationAddUserDevice = graphql(`
  mutation MutationAddUserDevice($deviceId: String!) {
    addUserDevice(deviceId: $deviceId)
  }
`);
