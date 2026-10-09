import {graphql} from '../shared/api/gql';

export const MutationLogin = graphql(
  `
    mutation MutationLogin($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
        refreshToken
      }
    }
  `,
);

// 로그인 없이 키워드 알림을 받는 기기 계정. X-Device-Id 필수(http-client 가 붙인다).
// 같은 기기면 늘 같은 게스트를 돌려준다 — 그 기기에서 실제 로그인하면 계정으로 합쳐진다.
export const MutationGuestLogin = graphql(`
  mutation MutationGuestLogin {
    guestLogin {
      accessToken
      refreshToken
    }
  }
`);

export const MutationLoginByRefreshToken = graphql(`
  mutation MutationLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);

export const MutationSocialLogin = graphql(`
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
