import { gql } from '@apollo/client';

export const QueryUsersByAdmin = gql`
  query QueryUsersByAdmin($limit: Int!, $searchAfter: [String!], $keyword: String) {
    usersByAdmin(limit: $limit, searchAfter: $searchAfter, keyword: $keyword) {
      id
      email
      nickname
      birthYear
      gender
      createdAt
      searchAfter
    }
  }
`;

export const QueryUserByAdmin = gql`
  query QueryUserByAdmin($id: Int!) {
    userByAdmin(id: $id) {
      id
      email
      nickname
      birthYear
      gender
      favoriteCategories
      linkedSocialProviders
      createdAt
    }
  }
`;

export const QueryUsersTotalCountByAdmin = gql`
  query QueryUsersTotalCountByAdmin($keyword: String) {
    usersTotalCountByAdmin(keyword: $keyword)
  }
`;
