import { gql } from '@apollo/client'

export const QueryCategories = gql`
  query QueryCategories {
    categories {
      id
      name
    }
  }
`
