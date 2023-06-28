import { gql } from "@apollo/client";

export const QueryCategories = gql`
  query {
    categories {
      id
      name
    }
  }
`;
