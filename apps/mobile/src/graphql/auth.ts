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
