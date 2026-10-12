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

  /** 게스트 세션 — 로그인 없이 키워드 알림을 받는 기기 계정(X-Device-Id 로 식별, execute 가 붙인다). */
  static async guestLogin() {
    return execute(MutationGuestLogin).then((res) => res.data);
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

  static async updateKeyword(variables: AddNotificationKeywordVariables) {
    return execute(MutationAddNotificationKeyword, variables).then((res) => res.data);
  }

  /** 문장 → 키워드 알림 조건 + 지난 30일 미리보기(서버 Haiku 5.5). 해석 못 하면 null. */
  static async parseNotificationIntent(variables: { text: string }) {
    return execute(QueryParseNotificationIntent, variables).then(
      (res) => res.data?.parseNotificationIntent ?? null,
    );
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

// 수기 — web codegen 이 막혀 있다(dev 스키마 사망). 백엔드 crawling-server 7d6cbd71.
const MutationGuestLogin = new TypedDocumentString<
  { guestLogin: { accessToken: string } },
  Record<string, never>
>(`
  mutation MutationGuestLogin {
    guestLogin {
      accessToken
    }
  }
`);

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

/**
 * 수기 TypedDocumentString — `priceDropOnly` 가 codegen 생성 타입에 없다.
 * dev 엔드포인트 사망으로 스키마 재생성이 막혀 있다(shared/api/keyword 주석 참고).
 *
 * ★`src/graphql/keyword.ts` 의 동명 Apollo gql 문서는 **쓰이지 않는다**(레거시).
 * 실제 목록 조회는 이 문서다 — 필드를 추가할 땐 여기를 고쳐야 한다.
 */
const QueryMypageKeyword = new TypedDocumentString<
  {
    notificationKeywordsByMe: {
      id: string;
      keyword: string;
      priceDropOnly: boolean;
      minPrice?: number | null;
      maxPrice?: number | null;
      excludeKeywords?: string[] | null;
    }[];
  },
  QueryMypageKeywordQueryVariables
>(`
  query QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {
    notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {
      id
      keyword
      priceDropOnly
      minPrice
      maxPrice
      excludeKeywords
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
type AddNotificationKeywordVariables = {
  keyword: string;
  fromRecommendation?: boolean;
  priceDropOnly?: boolean;
  /** 「문장으로 알림 만들기」처럼 등록과 동시에 조건을 거는 경우 */
  minPrice?: number | null;
  maxPrice?: number | null;
  excludeKeywords?: string[];
};

const MutationAddNotificationKeyword = new TypedDocumentString<
  { addNotificationKeyword: boolean },
  AddNotificationKeywordVariables
>(`
  mutation MutationAddNotificationKeyword(
    $keyword: String!
    $fromRecommendation: Boolean
    $priceDropOnly: Boolean
    $minPrice: Int
    $maxPrice: Int
    $excludeKeywords: [String!]
  ) {
    addNotificationKeyword(
      keyword: $keyword
      fromRecommendation: $fromRecommendation
      priceDropOnly: $priceDropOnly
      minPrice: $minPrice
      maxPrice: $maxPrice
      excludeKeywords: $excludeKeywords
    )
  }
`);

export type NotificationIntent = {
  keyword: string;
  excludeKeywords: string[];
  minPrice: number | null;
  maxPrice: number | null;
  /** 지난 30일 이 조건이면 왔을 알림 수(대략) */
  recentMatchCount: number;
  recentSamples: { id: number; title: string; price: number | null }[];
  /** 키워드 후보 전부(구체적인 것부터)와 각자의 30일 건수 */
  candidates: { keyword: string; recentMatchCount: number }[];
};

/** 수기 TypedDocumentString — 위와 같은 이유(codegen 스키마가 뒤처져 있다). */
const QueryParseNotificationIntent = new TypedDocumentString<
  { parseNotificationIntent: NotificationIntent | null },
  { text: string }
>(`
  query QueryParseNotificationIntent($text: String!) {
    parseNotificationIntent(text: $text) {
      keyword
      excludeKeywords
      minPrice
      maxPrice
      recentMatchCount
      recentSamples {
        id
        title
        price
      }
      candidates {
        keyword
        recentMatchCount
      }
    }
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
