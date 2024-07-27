import { QueryMyCategories } from '@/graphql/auth';
import { getClient } from '@/lib/client';
import { User } from '@/types/user';

const getMyCategories = async () => {
  return getClient().query<{ me: Pick<User, 'favoriteCategories'> }>({
    query: QueryMyCategories,
  });
};

export { getMyCategories };
