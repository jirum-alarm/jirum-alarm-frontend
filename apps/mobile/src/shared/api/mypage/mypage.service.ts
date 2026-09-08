import {
  MutationAddMyNotificationKeyword,
  MutationRemoveMyNotificationKeyword,
  MutationUpdateKeywordPriceDropOnly,
  MutationUpdateMyPassword,
  MutationUpdateMyProfile,
  MutationWithdraw,
  QueryMyNotificationKeywords,
  QueryMyProfile,
} from '@/graphql/mypage';
import type {MutationUpdateMyProfileMutationVariables} from '@/shared/api/gql/graphql';
import {HttpClient} from '@/shared/lib/client';

export type MyProfile = {
  id: string;
  email: string;
  nickname: string;
  birthYear?: number | null;
  gender?: 'FEMALE' | 'MALE' | null;
  favoriteCategories?: number[] | null;
};

export type MyKeyword = {
  id: string;
  keyword: string;
  priceDropOnly: boolean;
};

/**
 * 내정보 프로필·비밀번호·탈퇴·키워드. web `shared/api/auth` + `shared/api/keyword`.
 *
 * web 은 `getMe` 실패 시 `redirect(PAGE.LOGIN)` 을 던지는데 앱엔 그 개념이 없다 —
 * `RootNavigator` 가 토큰(`useAuth`)으로 앱 전체를 가르므로, 여기서 인증 오류를
 * 판정해 화면을 옮기면 두 판정처가 어긋난다. 에러는 그대로 올린다.
 */
export class MyPageService {
  static async getMyProfile() {
    const res = await HttpClient.withAccessToken().execute(QueryMyProfile);
    return (res.data?.me ?? null) as MyProfile | null;
  }

  static async updateMyProfile(
    variables: MutationUpdateMyProfileMutationVariables,
  ) {
    const res = await HttpClient.withAccessToken().execute(
      MutationUpdateMyProfile,
      variables,
    );
    return res.data;
  }

  static async updateMyPassword(variables: {password: string}) {
    const res = await HttpClient.withAccessToken().execute(
      MutationUpdateMyPassword,
      variables,
    );
    return res.data;
  }

  static async withdraw() {
    const res = await HttpClient.withAccessToken().execute(MutationWithdraw);
    return res.data;
  }

  /** web 과 같은 상한 20개. 그 이상은 서버가 거절한다. */
  static async getMyKeywords(limit = 20) {
    const res = await HttpClient.withAccessToken().execute(
      QueryMyNotificationKeywords,
      {limit},
    );
    return (res.data?.notificationKeywordsByMe ?? []) as MyKeyword[];
  }

  static async addKeyword(variables: {
    keyword: string;
    fromRecommendation?: boolean;
    priceDropOnly?: boolean;
  }) {
    const res = await HttpClient.withAccessToken().execute(
      MutationAddMyNotificationKeyword,
      variables,
    );
    return res.data;
  }

  static async removeKeyword(variables: {id: number}) {
    const res = await HttpClient.withAccessToken().execute(
      MutationRemoveMyNotificationKeyword,
      variables,
    );
    return res.data;
  }

  static async updateKeywordPriceDropOnly(variables: {
    id: number;
    priceDropOnly: boolean;
  }) {
    const res = await HttpClient.withAccessToken().execute(
      MutationUpdateKeywordPriceDropOnly,
      variables,
    );
    return res.data;
  }
}
