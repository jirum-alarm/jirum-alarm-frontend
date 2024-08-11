import { CategoryService } from '@/shared/api/category';
import { queryOptions } from '@tanstack/react-query';
import { CategoryQueries } from './category.queries';

export const CategoryQueriesServer = {
  all: () => ['category'],
  myCategories: () =>
    queryOptions({
      queryKey: [...CategoryQueries.categories().queryKey, 'my'],
      queryFn: () => CategoryService.getMyCategoriesServer(),
    }),
};
