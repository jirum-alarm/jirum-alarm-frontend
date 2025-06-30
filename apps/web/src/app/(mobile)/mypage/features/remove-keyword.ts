import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/components/common/Toast';
import { AuthQueries } from '@/entities/auth';
import { AuthService } from '@/shared/api/auth';

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
