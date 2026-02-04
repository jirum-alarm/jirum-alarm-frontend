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
      toast('비밀번호 변경이 완료됐어요.');
      router.push(COMPLETE_ROUTE);
    },
    onError: () => {
      toast('비밀번호 변경중 에러가 발생했어요.');
    },
  });
};
