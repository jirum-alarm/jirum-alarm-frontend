import { gql } from "@apollo/client";

export const QueryLogin = gql`
  query QueryLogin($email: String!, $password: String!) {
    adminLogin(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
`;

export const QueryLogout = gql`
  query QueryLogout {
    logout
  }
`;

export const QueryAdminMe = gql`
  query QueryAdminMe {
    adminMe {
      id
      email
      name
      createdAt
    }
  }
`;

export const QueryLoginByRefreshToken = gql`
  query QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`;
