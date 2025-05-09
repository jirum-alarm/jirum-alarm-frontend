import { useRouter } from 'next/navigation';

import { deleteAccessToken } from '@/app/actions/token';

const useLogout = () => {
  const router = useRouter();
  const logout = () => {
    deleteAccessToken();
    router.push('/auth/signin');
  };

  return { logout };
};

export default useLogout;
