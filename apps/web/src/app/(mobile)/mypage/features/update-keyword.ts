import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/components/common/Toast';

import { AuthService } from '@shared/api/auth';

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
