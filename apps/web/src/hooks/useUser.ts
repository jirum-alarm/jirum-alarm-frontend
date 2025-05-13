'use client';

import { useQuery } from '@tanstack/react-query';

import { AuthQueries } from '@/entities/auth';

export const useUser = () => {
  const { data: { me } = {} } = useQuery(AuthQueries.me());

  return { me };
};
