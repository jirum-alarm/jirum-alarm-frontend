import { CategoryService } from '@/shared/api/category';
import { queryOptions } from '@tanstack/react-query';

export const categoryQueries = {
  all: () => ['category'],
  categories: () =>
    queryOptions({
      queryKey: [...categoryQueries.all(), 'list'],
      queryFn: () => CategoryService.getCategories(),
    }),
  myCategories: () =>
    queryOptions({
      queryKey: [...categoryQueries.categories().queryKey, 'my'],
      queryFn: () => CategoryService.getMyCategories(),
    }),
};
