import { gql } from "@apollo/client";

export const QueryMe = gql`
  query QueryMe {
    me {
      id
      email
    }
  }
`;
