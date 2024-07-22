import { QueryMyCategories } from '@/graphql/auth';
import { User } from '@/types/user';
import { useSuspenseQuery } from '@apollo/client';

const useGetMyCategories = () => {
  return useSuspenseQuery<{ me: Pick<User, 'favoriteCategories'> }>(QueryMyCategories);
};

export { useGetMyCategories };
