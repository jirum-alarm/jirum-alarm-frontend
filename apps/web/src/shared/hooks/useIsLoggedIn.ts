'use client';

import { useEffect, useState } from 'react';

import { getAccessToken } from '@/app/actions/token';

const useIsLoggedIn = () => {
  const [accessToken, setAccessToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAccessToken = async () => {
      setIsLoading(true);
      try {
        const token = await getAccessToken();
        setAccessToken(token);
      } catch (error) {
        console.error('Failed to fetch access token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAccessToken();
  }, []);

  return !isLoading && !!accessToken;
};

export default useIsLoggedIn;
