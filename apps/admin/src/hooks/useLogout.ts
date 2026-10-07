import { useRouter } from 'next/navigation';

import { deleteAccessToken } from '@/app/actions/token';

const useLogout = () => {
  const router = useRouter();
  // 쿠키가 지워지기 전에 이동하면 미들웨어가 다시 홈으로 돌려보낸다
  const logout = async () => {
    await deleteAccessToken();
    router.replace('/auth/signin');
  };

  return { logout };
};

export default useLogout;
