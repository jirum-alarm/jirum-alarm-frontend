import { removeAccessToken, removeRefreshToken } from '@/app/actions/token';
import { PAGE } from '@/constants/page';

export const useLogout = () => {
  const logout = () => {
    removeAccessToken();
    removeRefreshToken();
    window.location.replace(PAGE.HOME);
  };
  return logout;
};
