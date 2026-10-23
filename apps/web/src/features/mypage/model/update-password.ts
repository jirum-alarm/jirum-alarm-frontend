import { useMutation } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { useToast } from '@/shared/ui/common/Toast';

const COMPLETE_ROUTE = '/mypage/account';

export const useUpdatePassword = () => {
  const { toast } = useToast();
  const router = useMyRouter();
  return useMutation({
    mutationFn: AuthService.updatePassword,
    onSuccess: () => {
      toast.success('비밀번호 변경이 완료됐어요.');
      router.push(COMPLETE_ROUTE);
    },
    onError: () => {
      toast.error('비밀번호를 바꾸지 못했어요.');
    },
  });
};
