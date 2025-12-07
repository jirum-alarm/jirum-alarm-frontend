import { queryOptions } from '@tanstack/react-query';

import { CategoryService } from '@shared/api/category';

import { getCategoriesForUser } from './category.api';

export const CategoryQueries = {
  all: () => ['category'],
  categories: () =>
    queryOptions({
      queryKey: [...CategoryQueries.all(), 'list'],
      queryFn: () => CategoryService.getCategories(),
      staleTime: 1000 * 60 * 60 * 24,
    }),
  myCategories: () =>
    queryOptions({
      queryKey: [...CategoryQueries.categories().queryKey, 'my'],
      queryFn: () => CategoryService.getMyCategories(),
      staleTime: 1000 * 60 * 60 * 24,
    }),
  categoriesForUser: () =>
    queryOptions({
      queryKey: [...CategoryQueries.categories().queryKey, 'user'],
      queryFn: () => getCategoriesForUser(),
      staleTime: 1000 * 60 * 60 * 24,
    }),
};
