import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AuthService } from '@/shared/api/auth';
import { triggerHaptic } from '@/shared/lib/webview';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

export const useRemoveKeyword = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AuthService.removeKeyword,
    onSuccess: () => {
      triggerHaptic('light');
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
    },
    onError: () => {
      triggerHaptic('error');
      toast.error('키워드를 삭제하지 못했어요.');
    },
  });
};
