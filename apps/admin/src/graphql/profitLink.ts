import { gql } from '@apollo/client';

export const QueryHasTossSession = gql`
  query HasTossSession {
    hasTossSession
  }
`;

export const MutationSetTossSession = gql`
  mutation SetTossSession($token: String!) {
    setTossSession(token: $token)
  }
`;
