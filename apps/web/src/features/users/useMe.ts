import { useQuery } from '@apollo/client';

import { QueryMe } from '@/graphql/auth';
import { User } from '@/types/user';

export const useMe = () => {
  const result = useQuery<{ me: User }>(QueryMe);

  return result;
};
