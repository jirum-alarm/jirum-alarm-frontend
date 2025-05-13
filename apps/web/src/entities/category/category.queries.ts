import { queryOptions } from '@tanstack/react-query';

import { CategoryService } from '@/shared/api/category';

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
  categoriesForUser: (isLoggedIn: boolean) =>
    queryOptions({
      queryKey: [...CategoryQueries.categories().queryKey, 'user'],
      queryFn: () => getCategoriesForUser(isLoggedIn),
      staleTime: 1000 * 60 * 60 * 24,
    }),
  categoriesForUserServer: (isLoggedIn: boolean, cookieHeader: string) =>
    queryOptions({
      queryKey: [...CategoryQueries.categories().queryKey, 'user'],
      queryFn: () => getCategoriesForUser(isLoggedIn, cookieHeader),
      staleTime: 1000 * 60 * 60 * 24,
    }),
};
