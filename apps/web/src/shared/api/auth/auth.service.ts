import { httpClient } from '@/shared/lib/http-client';
import { graphql } from '../gql';
import { QueryMypageKeywordQueryVariables } from '../gql/graphql';

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
