import { StorageTokenKey } from '@/types/enum/auth';

export const useLogout = () => {
  const handleLogout = () => {
    localStorage.removeItem(StorageTokenKey.ACCESS_TOKEN);
    localStorage.removeItem(StorageTokenKey.REFRESH_TOKEN);
    window.location.href = '/';
  };
  return handleLogout;
};
