import { QueryHookOptions, useQuery } from '@apollo/client';

import { QueryCategoriesQuery, QueryCategoriesQueryVariables } from '@/generated/gql/graphql';
import { QueryCategories } from '@/graphql/category';

export const useGetCategories = (
  options?: QueryHookOptions<QueryCategoriesQuery, QueryCategoriesQueryVariables>,
) => {
  return useQuery<QueryCategoriesQuery, QueryCategoriesQueryVariables>(QueryCategories, {
    ...options,
  });
};
