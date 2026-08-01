import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SettingService } from '@/shared/api/setting';
import { useToast } from '@/shared/ui/common/Toast';

import { SettingQueries } from '@/entities/notification';

export const useUpdatePriceDropOnly = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey = SettingQueries.pushSetting().queryKey;

  return useMutation({
    mutationFn: (priceDropOnly: boolean) => SettingService.updatePriceDropOnly(priceDropOnly),
    // 토글은 즉시 반응해야 하므로 낙관적 갱신. 실패하면 이전 값으로 되돌린다.
    onMutate: async (priceDropOnly) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) =>
        old ? { ...old, pushSetting: { ...old.pushSetting, priceDropOnly } } : old,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast('알림 설정 변경에 실패했습니다.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
};
