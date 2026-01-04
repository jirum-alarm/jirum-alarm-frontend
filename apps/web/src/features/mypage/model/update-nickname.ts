import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import useGoBack from '@/shared/hooks/useGoBack';
import { useToast } from '@/shared/ui/Toast';

import { AuthQueries } from '@/entities/auth';

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
