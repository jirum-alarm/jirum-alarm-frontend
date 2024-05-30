import { QueryMe } from '@/graphql/auth';
import { User } from '@/types/user';
import { useQuery } from '@apollo/client';

export const useMe = () => {
  const result = useQuery<{ me: User }>(QueryMe);

  return result;
};
