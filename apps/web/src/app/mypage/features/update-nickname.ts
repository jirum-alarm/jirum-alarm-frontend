import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/components/common/Toast';
import { AuthQueries } from '@/entities/auth';
import useGoBack from '@/hooks/useGoBack';
import { AuthService } from '@/shared/api/auth';

export const useUpdateNickname = () => {
  const { toast } = useToast();
  const goBack = useGoBack();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.updateMe,
    onSuccess: () => {
      toast('닉네임이 저장됐어요');
      queryClient.invalidateQueries({ queryKey: AuthQueries.all() });
      goBack();
    },
    onError: () => {
      toast('닉네임 저장중 에러가 발생했어요');
    },
  });
};
