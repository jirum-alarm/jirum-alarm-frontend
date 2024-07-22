import { QueryMyCategories } from '@/graphql/auth';
import { User } from '@/types/user';
import { skipToken, useSuspenseQuery } from '@apollo/client';

const useGetMyCategories = ({ suspenseSkip }: { suspenseSkip?: boolean } = {}) => {
  return useSuspenseQuery<{ me: Pick<User, 'favoriteCategories'> }>(
    QueryMyCategories,
    suspenseSkip ? skipToken : undefined,
  );
};

export { useGetMyCategories };
