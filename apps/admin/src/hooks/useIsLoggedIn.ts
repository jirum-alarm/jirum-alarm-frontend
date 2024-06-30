import useAccessToken from './useAccessToken';

const useIsLoggedIn = () => {
  const { isLoading, accessToken } = useAccessToken();
  return !isLoading && !!accessToken;
};

export default useIsLoggedIn;
