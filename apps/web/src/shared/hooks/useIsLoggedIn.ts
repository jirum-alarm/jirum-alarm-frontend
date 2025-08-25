'use client';

import { atom, useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { getAccessToken } from '@/app/actions/token';

const accessTokenAtom = atom<string | null>(null);

const useIsLoggedIn = () => {
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccessToken = async () => {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        setAccessToken(token ?? null);
      } catch (error) {
        console.error('Failed to fetch access token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccessToken();
  }, [setAccessToken]);

  return { isLoggedIn: !isLoading && !!accessToken, isLoading };
};

export default useIsLoggedIn;
