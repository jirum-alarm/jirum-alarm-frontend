import { gql } from '@apollo/client';

export const MutationAdminLogin = gql`
  mutation MutationAdminLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`;

export const QueryAdminMe = gql`
  query QueryAdminMe {
    adminMe {
      id
      name
      email
    }
  }
`;
