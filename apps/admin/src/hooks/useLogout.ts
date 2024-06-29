import { deleteAccessToken } from '@/app/actions/token';

const useLogout = () => {
  const logout = () => {
    deleteAccessToken();
    window.location.href = '/';
  };

  return { logout };
};

export default useLogout;
