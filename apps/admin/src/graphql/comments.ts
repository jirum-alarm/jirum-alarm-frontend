import { gql } from '@apollo/client';

export const QueryCommentsByAdmin = gql`
  query commentsByAdmin($hotDealKeywordId: Int!, $synonyms: [String!], $excludes: [String!]) {
    commentsByAdmin(hotDealKeywordId: $hotDealKeywordId, synonyms: $synonyms, excludes: $excludes)
  }
`;
