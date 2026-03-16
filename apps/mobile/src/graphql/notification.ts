import {graphql} from '../shared/api/gql';

export const MutationAddPushToken = graphql(`
  mutation MutationAddPushToken($token: String!, $tokenType: TokenType!) {
    addPushToken(token: $token, tokenType: $tokenType)
  }
`);
