import { QueryMe } from '@/graphql/auth';
import { getClient } from '@/lib/client';
import { User } from '@/types/user';
import { useQuery } from '@apollo/client';

export const useMe = () => {
  const result = useQuery<{ me: User }>(QueryMe);

  return result;
};

export const getMe = async () => {
  return getClient().query<{ me: User }>({ query: QueryMe });
};
