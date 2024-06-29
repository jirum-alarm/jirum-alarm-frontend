import { deleteAccessToken } from '@/app/actions/token';
import { useRouter } from 'next/navigation';

const useLogout = () => {
  const router = useRouter();
  const logout = () => {
    deleteAccessToken();
    router.push('/auth/signin');
  };

  return { logout };
};

export default useLogout;
