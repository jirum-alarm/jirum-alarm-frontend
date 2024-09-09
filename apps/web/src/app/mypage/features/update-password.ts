import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/common/Toast';
import { AuthService } from '@/shared/api/auth';

const COMPLETE_ROUTE = '/mypage/account';

export const useUpdatePassword = () => {
  const { toast } = useToast();
  const router = useRouter();
  return useMutation({
    mutationFn: AuthService.updatePassword,
    onSuccess: () => {
      toast('비밀번호 변경이 완료됐어요.');
      router.push(COMPLETE_ROUTE);
    },
    onError: () => {
      toast('비밀번호 변경중 에러가 발생했어요.');
    },
  });
};
