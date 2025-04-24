'use client';

import { useQuery } from '@tanstack/react-query';

import { AuthQueries } from '@/entities/auth';

export const useUser = () => {
  const { data } = useQuery(AuthQueries.me());
  return { me: data?.me };
};
