import { useQuery } from '@apollo/client/react';

import { QueryCategoriesQuery, QueryCategoriesQueryVariables } from '@/generated/gql/graphql';
import { QueryCategories } from '@/graphql/category';

import { QueryOptions } from './options';

export const useGetCategories = (
  options?: QueryOptions<QueryCategoriesQuery, QueryCategoriesQueryVariables>,
) => {
  return useQuery<QueryCategoriesQuery, QueryCategoriesQueryVariables>(QueryCategories, {
    ...options,
  });
};
