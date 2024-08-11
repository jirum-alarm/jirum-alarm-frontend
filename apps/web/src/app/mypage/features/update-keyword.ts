import { useToast } from '@/components/common/Toast';
import { AuthQueries } from '@/entities/auth';
import { AuthService } from '@/shared/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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
