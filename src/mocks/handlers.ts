import { graphql } from 'msw'

const QueryProducts = graphql.query('QueryProducts', ({ query }) => {
  console.log('intercept', query)
})

export const handlers = [QueryProducts]
