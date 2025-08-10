import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from '@/components/common/Toast';
import useGoBack from '@/hooks/useGoBack';

import { AuthService } from '@shared/api/auth';

import { AuthQueries } from '@entities/auth';
import { CategoryQueries } from '@entities/category';

export const useUpdateCategory = () => {
  const { toast } = useToast();
  const goBack = useGoBack();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.updateMe,
    onSuccess: () => {
      toast('관심 카테고리가 저장됐어요.');
      queryClient.invalidateQueries({ queryKey: AuthQueries.all() });
      queryClient.invalidateQueries({ queryKey: CategoryQueries.all() });
      goBack();
    },
    onError: () => {
      toast('관심 카테고리 저장중 에러가 발생했어요.');
    },
  });
};
