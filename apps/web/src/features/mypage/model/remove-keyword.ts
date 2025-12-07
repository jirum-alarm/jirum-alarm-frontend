import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthQueries } from '@entities/auth';

import { AuthService } from '@/shared/api/auth';
import { useToast } from '@/shared/ui/Toast';

export const useRemoveKeyword = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.removeKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
    },
    onError: () => {
      toast('키워드 삭제에 실패했습니다.');
    },
  });
};
