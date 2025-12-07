import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthService } from '@shared/api/auth';
import { useToast } from '@shared/ui/Toast';

import { AuthQueries } from '@entities/auth';

export const useUpdateKeyword = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.updateKeyword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
    },
    onError: () => {
      toast('키워드 저장에 실패했습니다.');
    },
  });
};
