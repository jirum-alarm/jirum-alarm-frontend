import { CategoryService } from '@/shared/api/category';
import { queryOptions } from '@tanstack/react-query';
import { getCategoriesForUser } from './category.api';

export const CategoryQueries = {
  all: () => ['category'],
  categories: () =>
    queryOptions({
      queryKey: [...CategoryQueries.all(), 'list'],
      queryFn: () => CategoryService.getCategories(),
    }),
  myCategories: () =>
    queryOptions({
      queryKey: [...CategoryQueries.categories().queryKey, 'my'],
      queryFn: () => CategoryService.getMyCategories(),
    }),
  categoriesForUser: () =>
    queryOptions({
      queryKey: [...CategoryQueries.categories().queryKey, 'user'],
      queryFn: () => getCategoriesForUser(),
    }),
};
