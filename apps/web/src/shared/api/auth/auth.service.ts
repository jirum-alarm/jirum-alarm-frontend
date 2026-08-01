import { redirect } from 'next/navigation';

import { PAGE } from '@/shared/config/page';
import { execute } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import {
  MutationAddUserDeviceMutationVariables,
  MutationLoginMutationVariables,
  MutationRemoveNotificationKeywordMutationVariables,
  MutationSignupMutationVariables,
  MutationSocialLoginMutationVariables,
  MutationUpdatePasswordMutationVariables,
  MutationUpdateUserProfileMutationVariables,
  QueryMypageKeywordQueryVariables,
  QuerySocialAccessTokenQueryVariables,
  TypedDocumentString,
} from '../gql/graphql';

const AUTH_ERROR_CODES = new Set(['UNAUTHENTICATED', 'FORBIDDEN']);

// 5xx·네트워크 오류를 인증 실패로 오인하면 서버가 잠깐 흔들릴 때마다 로그아웃된다.
// UNAUTHENTICATED/FORBIDDEN 또는 401/403 일 때만 인증 오류로 판정한다.
const isAuthError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const status = (error as { response?: { status?: number } }).response?.status;
  if (status === 401 || status === 403) return true;
  if (typeof status === 'number' && status >= 500) return false;
  const errors = (error as { data?: { errors?: Array<{ extensions?: { code?: string } }> } }).data
    ?.errors;
  return (
    Array.isArray(errors) && errors.some((e) => AUTH_ERROR_CODES.has(e?.extensions?.code ?? ''))
  );
};

export class AuthService {
  static async loginByRefreshTokenMutation() {
    return execute(MutationLoginByRefreshToken).then((res) => res.data);
  }

  static async getMe() {
    return execute(QueryMe)
      .then((res) => res.data)
      .catch((error) => {
        if (isAuthError(error)) {
          redirect(PAGE.LOGIN);
        }
        throw error;
      });
  }

  static async getMyKeyword(variables: QueryMypageKeywordQueryVariables) {
    return execute(QueryMypageKeyword, variables).then((res) => res.data);
  }

  static async getRecommendedKeywords() {
    return execute(QueryRecommendedNotificationKeywords).then((res) => res.data);
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

  static async updateKeyword(variables: {
    keyword: string;
    fromRecommendation?: boolean;
    priceDropOnly?: boolean;
  }) {
    return execute(MutationAddNotificationKeyword, variables).then((res) => res.data);
  }

  static async removeKeyword(variables: MutationRemoveNotificationKeywordMutationVariables) {
    return execute(MutationRemoveNotificationKeyword, variables).then((res) => res.data);
  }

  static async addUserDevice(variables: MutationAddUserDeviceMutationVariables) {
    return execute(MutationAddUserDevice, variables).then((res) => res.data);
  }

  static async socialLogin(variables: MutationSocialLoginMutationVariables) {
    console.log('socialLogin variables:', variables);
    return execute(MutationSocialLogin, variables).then((res) => {
      console.log('socialLogin response:', res);
      return res.data;
    });
  }

  static async socialAccessToken(variables: QuerySocialAccessTokenQueryVariables) {
    return execute(QuerySocialAccessToken, variables).then((res) => res.data);
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

const QueryRecommendedNotificationKeywords = graphql(`
  query QueryRecommendedNotificationKeywords {
    recommendedNotificationKeywords
  }
`);

/**
 * 수기 TypedDocumentString — `priceDropOnly` 인자가 codegen 생성 타입에 없다.
 * dev 엔드포인트가 죽어 스키마 재생성이 막혀 있기 때문(shared/api/keyword 주석 참고).
 * dev 복구 후 codegen 을 돌리면 graphql() 로 되돌릴 수 있다.
 */
const MutationAddNotificationKeyword = new TypedDocumentString<
  { addNotificationKeyword: boolean },
  { keyword: string; fromRecommendation?: boolean; priceDropOnly?: boolean }
>(`
  mutation MutationAddNotificationKeyword(
    $keyword: String!
    $fromRecommendation: Boolean
    $priceDropOnly: Boolean
  ) {
    addNotificationKeyword(
      keyword: $keyword
      fromRecommendation: $fromRecommendation
      priceDropOnly: $priceDropOnly
    )
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

const MutationSocialLogin = graphql(`
  mutation MutationSocialLogin(
    $oauthProvider: OauthProvider!
    $socialAccessToken: String!
    $email: String
    $nickname: String
    $birthYear: Float
    $gender: Gender
    $favoriteCategories: [Int!]
  ) {
    socialLogin(
      oauthProvider: $oauthProvider
      socialAccessToken: $socialAccessToken
      email: $email
      nickname: $nickname
      birthYear: $birthYear
      gender: $gender
      favoriteCategories: $favoriteCategories
    ) {
      accessToken
      refreshToken
      type
    }
  }
`);

const QuerySocialAccessToken = graphql(`
  query QuerySocialAccessToken($code: String!, $oauthProvider: OauthProvider!, $state: String!) {
    socialAccessToken(code: $code, oauthProvider: $oauthProvider, state: $state)
  }
`);
