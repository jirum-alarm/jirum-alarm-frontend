import { QueryCategories } from '@/graphql/category';
import { ICategoryOutput } from '@/graphql/interface/category';
import { getClient } from '@/lib/client';

const getCategories = async () => {
  return getClient().query<ICategoryOutput>({
    query: QueryCategories,
  });
};

export { getCategories };
