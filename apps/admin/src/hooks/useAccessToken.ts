import { getAccessToken } from '@/app/actions/token';
import { useEffect, useState } from 'react';

const useAccessToken = () => {
  const [accessToken, setAccessToken] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const accessToken = await getAccessToken();
      setIsLoading(false);
      setAccessToken(accessToken);
    })();
  }, []);
  return { accessToken, isLoading };
};

export default useAccessToken;
