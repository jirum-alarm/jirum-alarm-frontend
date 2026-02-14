import { QueryHookOptions, useQuery } from '@apollo/client';

import { QueryCategories } from '@/graphql/category';

export interface CategoryData {
  id: number;
  name: string;
}

export const useGetCategories = (options?: QueryHookOptions) => {
  return useQuery<{ categories: CategoryData[] }>(QueryCategories, {
    ...options,
  });
};
