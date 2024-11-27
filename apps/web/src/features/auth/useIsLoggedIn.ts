import { getAccessToken } from '@/app/actions/token';
import { useEffect, useState } from 'react';

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
