import { useMutation, useQueryClient } from '@tanstack/react-query';

import { KeywordSettingService } from '@/shared/api/keyword';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

/** 키워드별 "가격 내려갈 때만 받기" 토글. 설정은 유저 전역이 아니라 키워드 단위다. */
export const useUpdateKeywordPriceDropOnly = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: { id: number; priceDropOnly: boolean }) =>
      KeywordSettingService.updatePriceDropOnly(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AuthQueries.keyword() });
    },
    onError: () => {
      toast('알림 설정 변경에 실패했습니다.');
    },
  });
};
