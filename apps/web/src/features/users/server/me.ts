import { QueryMe } from '@/graphql/auth';
import { getClient } from '@/lib/client';
import { User } from '@/types/user';

export const getMe = async () => {
  return getClient().query<{ me: User }>({ query: QueryMe });
};
